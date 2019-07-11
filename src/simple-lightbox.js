import $ from 'jquery';

import { NAMESPACE } from './consts';
import ViewFactory from './views/view-factory';

const DEFAULTS = {
  links: 'a[rel="lightbox"]',
  owner: 'body',
  imageExt: /^(jpg|jpeg|png|gif|bmp|webp)$/,
  template: `
<div class="lb-modal">
  <div class="lb-wrapper">
    <div class="lb-toolbar">
      <div class="lb-page"></div>
      <div class="lb-caption"></div>
      <div class="lb-tools">
        <div class="lb-tool lb-zoom" title="Zoom"></div>
        <div class="lb-tool lb-window" title="Open new window"></div>
        <div class="lb-tool lb-close" title="Close"></div>
      </div>
    </div>
    <div class="lb-icon lb-prev"></div>
    <div class="lb-icon lb-next"></div>
    <div class="lb-content">
      <div class="lb-loading"></div>
    </div>
  </div>
</div>
`
};

export default class SimpleLightbox {
  constructor(elem, options = {}) {
    this.options = $.extend({}, DEFAULTS, options);

    this.$elem = $(elem);
    this.uid = new Date().getTime() + Math.random();
    this.namespace = `${NAMESPACE}-${this.uid}`;

    this.unbind();
    this.bind();
  }

  destroy() {
    if (this.modal) this.modal.close();
    this.unbind();
  }

  bind() {
    this.$elem.on(`click.${this.namespace}`, this.options.links, (e) => {
      if (!e.ctrlKey && !e.shiftKey && !e.metaKey) {
        e.preventDefault();
        this.open($(e.currentTarget));
      }
    });
  }

  unbind() {
    this.$elem.off(`.${this.namespace}`);
  }

  open($link) {
    this.modal = new Modal(this);
    this.modal.setContent($link);
  }

  links() {
    return this.$elem.find(this.options.links);
  }

  current() {
    return this.links().filter('.lb-current');
  }

  setCurrent($link) {
    let $links = this.links();
    $links.removeClass('lb-current');
    $link.addClass('lb-current');
  }

  nextLink() {
    let $links = this.links();
    let index = $links.index(this.current());
    if (index < $links.length - 1) {
      return $links.eq(index + 1);
    } else {
      return null;
    }
  }

  prevLink() {
    let $links = this.links();
    let index = $links.index(this.current());
    if (index > 0) {
      return $links.eq(index - 1);
    } else {
      return null;
    }
  }

  static modals(owner = window.document) {
    return $(owner).find(`.${NAMESPACE}`).map((i, elem) => {
      return $(elem).data(NAMESPACE);
    }).get();
  }

  static getDefaults() {
    return DEFAULTS;
  }

  static setDefaults(options) {
    return $.extend(DEFAULTS, options);
  }
}

class Modal {
  constructor(lightbox, options = {}) {
    this.lightbox = lightbox;
    this.options = lightbox.options;

    this.$owner = $(this.options.owner);
    this.ownerDocument = this.$owner.get(0).ownerDocument;
    $(this.ownerDocument.body).addClass(`${NAMESPACE}-disable-scroll`);

    this.$container = $(this.options.template).addClass(NAMESPACE).data(NAMESPACE, this);
    this.$container.appendTo(this.$owner).show();

    this.$wrapper = this.$container.find('.lb-wrapper');
    this.$content = this.$container.find('.lb-content');
    this.$caption = this.$container.find('.lb-caption');
    this.$page = this.$container.find('.lb-page');
    this.$loading = this.$container.find('.lb-loading');
    this.zooming = false;

    this.keyboardHandler = new KeyboardHandler(this);
    this.wheelHandler = new WheelHandler(this);

    this.bind();
  }

  bind() {
    this.$container.on('click', (e) => {
      if (!this.zooming) this.close();
    }).on('click', '.lb-content, .lb-toolbar, .lb-icon', (e) => {
      e.stopPropagation();
    }).on('click', '.lb-close', (e) => {
      this.close();
      e.stopPropagation();
    }).on('click', '.lb-window', (e) => {
      this.openWindow();
      e.stopPropagation();
    }).on('click', '.lb-zoom', (e) => {
      this.toggleZoom();
      e.stopPropagation();
    }).on('click', '.lb-next', (e) => {
      this.next();
      e.stopPropagation();
    }).on('click', '.lb-prev', (e) => {
      this.prev();
      e.stopPropagation();
    }).hover((e) => {
      this.$wrapper.addClass('lb-hover');
    }, (e) => {
      this.$wrapper.removeClass('lb-hover');
    });

    this.keyboardHandler.bind();
    this.wheelHandler.bind();
  }

  unbind() {
    this.$container.off();

    this.keyboardHandler.unbind();
    this.wheelHandler.unbind();
  }

  close() {
    this.unbind();
    this.$container.remove();
    $(this.ownerDocument.body).removeClass(`${NAMESPACE}-disable-scroll`);
    if (this.view) this.view.destroy();
  }

  next() {
    let $next = this.lightbox.nextLink();
    if ($next) this.setContent($next);
  }

  prev() {
    let $prev = this.lightbox.prevLink();
    if ($prev) this.setContent($prev);
  }

  toggleZoom() {
    if (this.zooming) {
      this.$container.removeClass('lb-zooming');
      this.zooming = false;
    } else {
      this.$container.addClass('lb-zooming');
      this.zooming = true;
    }
    if (this.view) this.view.init(this.zooming);
  }

  openWindow() {
    window.open(this.lightbox.current().attr('href'));
  }

  wheel(dx, dy) {
    if (this.view) this.view.wheel(dx, dy);
  }

  setContent($link) {
    this.lightbox.setCurrent($link);

    let $links = this.lightbox.links();
    this.$page.text(`${$links.index($link) + 1}/${$links.length}`);

    let $cap = $('<span>').attr('title', $link.attr('title')).text($link.attr('title'))
    this.$caption.empty().append($cap);

    if (this.view) this.view.destroy();
    this.view = new ViewFactory(this).create($link);
    this.view.set($link.attr('href'), this.zooming);
  }

  loading() {
    this.$loading.show();
  }

  loaded() {
    this.$loading.hide();
  }
}

class KeyboardHandler {
  constructor(modal) {
    this.modal = modal;

    this.uid = new Date().getTime() + Math.random();
    this.namespace = `${NAMESPACE}-${this.uid}`;
  }

  bind() {
    $(document).on(`keydown.${this.namespace}`, (e) => {
      this.keydown(e.keyCode, e.ctrlKey, e.shiftKey);
      e.preventDefault();
    });
  }

  unbind() {
    $(document).off(`.${this.namespace}`);
  }

  keydown(keyCode, ctrl, shift) {
    switch(keyCode) {
    case 8:  // BACKSPACE
    case 33: // PAGE UP
    case 37: // <
      this.modal.prev();
      break;
    case 32: // SPACE
    case 34: // PAGE DOWN
    case 39: // >
      this.modal.next();
      break;
    case 13: // ENTER
      this.modal.toggleZoom();
      break;
    case 27: // ESC
      this.modal.close();
      break;
    }
  }
}

class WheelHandler {
  constructor(modal) {
    this.modal = modal;
  }

  bind() {
    this.modal.ownerDocument.addEventListener('wheel', this.handler, { passive: false });
  }

  unbind() {
    this.modal.ownerDocument.removeEventListener('wheel', this.handler, { passive: false });
  }

  handler(e) {
    e.preventDefault();
    SimpleLightbox.modals(this).forEach((modal) => {
      if (modal.zooming) {
        modal.wheel(e.deltaX, e.deltaY);
      } else {
        if (e.deltaY < 0) {
          modal.prev();
        } else {
          modal.next();
        }
      }
    });
  }
}
