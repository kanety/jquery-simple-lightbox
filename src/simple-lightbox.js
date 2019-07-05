import $ from 'jquery';

import { NAMESPACE } from './consts';

const DEFAULTS = {
  links: 'a[rel="lightbox"]',
  owner: 'body',
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
    <div class="lb-content"></div>
  </div>
</div>
`
};

export default class SimpleLightbox {
  constructor(elem, options = {}) {
    this.options = $.extend({}, DEFAULTS, options);

    this.$elem = $(elem);

    this.unbind();
    this.bind();
  }

  destroy() {
    this.unbind();
  }

  bind() {
    this.$elem.on(`click.${NAMESPACE}`, this.options.links, (e) => {
      e.preventDefault();
      this.open($(e.currentTarget));
    });
  }

  unbind() {
    this.$elem.off(`.${NAMESPACE}`);
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

  static modals() {
    return $(`.${NAMESPACE}`).map((i, elem) => {
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

    this.$container = $(this.options.template).addClass(NAMESPACE);
    this.$container.data(NAMESPACE, this);
    this.$container.appendTo(this.$owner).show();

    this.$content = this.$container.find('.lb-content');
    this.$caption = this.$container.find('.lb-caption');
    this.$page = this.$container.find('.lb-page');
    this.zooming = false;

    this.keyboardHandler = new KeyboardHandler(this);
    this.wheelHandler = new WheelHandler(this);
    this.imageView = new ImageView(this);

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
    });

    this.keyboardHandler.bind();
    this.wheelHandler.bind();
    this.imageView.bind();
  }

  unbind() {
    this.$container.off(`.${NAMESPACE}`);

    this.keyboardHandler.unbind();
    this.wheelHandler.unbind();
    this.imageView.unbind();
  }

  close() {
    this.unbind();
    this.$container.remove();
    this.$container = null;
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
    this.imageView.initImage(this.zooming);
  }

  openWindow() {
    window.open(this.lightbox.current().attr('href'));
  }

  setContent($link) {
    this.lightbox.setCurrent($link);

    let $links = this.lightbox.links();
    this.$page.text(`${$links.index($link) + 1}/${$links.length}`);

    let $cap = $('<span>').attr('title', $link.attr('title')).text($link.attr('title'))
    this.$caption.empty().append($cap);

    this.imageView.setImage($link.attr('href'));
  }
}

class ImageView {
  constructor(modal) {
    this.modal = modal;
    this.zooming = false;
    this.dragging = false;
  }

  bind() {
    this.modal.$container.on('mousedown',  (e) => {
      this.dragging = true;
      this.dragStart(e.pageX, e.pageY);
      e.preventDefault();
    }).on('mousemove', (e) => {
      if (this.dragging) this.drag(e.pageX, e.pageY);
      e.preventDefault();
    }).on('mouseup mouseleave', (e) => {
      this.dragging = false;
      e.preventDefault();
    }).on('dblclick', 'img', (e) => {
      this.toggleZoom(e.offsetX, e.offsetY);
      e.preventDefault();
    });

    $(window).on(`resize.${NAMESPACE}`, (e) => {
      this.initImage();
    });
  }

  unbind() {
    $(window).off(`.${NAMESPACE}`);
  }

  setImage(source) {
    if (this.$img) this.$img.remove();
    this.$img = $('<img>').attr('src', source).prependTo(this.modal.$content);

    this.initImage();
  }

  initImage(zooming = null) {
    if (zooming != null) this.zooming = zooming;

    let $img = this.$img;
    let $container = this.modal.$container;

    if (this.zooming) {
      $img.css({ 'max-width': '', 'max-height': '' });
    } else {
      $img.css({ 'max-width': '100%', 'max-height': '100%' });
    }

    this.movableX = 0;
    this.movableY = 0;

    if ($img.width() > $container.width()) {
      this.movableX += ($img.width() - $container.width()) / 2;
    }
    if ($img.height() > $container.height()) {
      this.movableY += ($img.height() - $container.height()) / 2;
    }

    if (this.movableX == 0 && this.movableY == 0) {
      $img.css({ 'cursor': 'auto', 'left': '0', 'transform': '' });
    } else {
      $img.css({ 'cursor': 'move' });
    }

    if (this.movableX != 0) {
      $img.css({ 'left': `-${this.movableX}px` });
    }

    if (!this.zooming) {
      this.transX = 0;
      this.transY = 0;
    }
    this.translate(this.transX, this.transY);
  }

  dragStart(x, y) {
    this.startX = x;
    this.startY = y;
    this.startTransX = this.transX;
    this.startTransY = this.transY;
  }

  drag(x, y) {
    let dx = this.startTransX + (x - this.startX);
    let dy = this.startTransY + (y - this.startY);
    this.translate(dx, dy);
  }

  translate(dx, dy) {
    if (dx < -this.movableX) dx = -this.movableX;
    if (dx > this.movableX) dx = this.movableX;
    if (dy < -this.movableY) dy = -this.movableY;
    if (dy > this.movableY) dy = this.movableY;

    this.transX = dx;
    this.transY = dy;
    this.$img.css('transform', `translate(${dx}px, ${dy}px)`);
  }

  wheel(dx, dy) {
    this.translate(this.transX + dx, this.transY - dy);
  }

  toggleZoom(offsetX, offsetY) {
    let dx = (this.$img.width() / 2 - offsetX) * (this.$img.get(0).naturalWidth / this.$img.width());
    let dy = (this.$img.height() / 2 - offsetY) * (this.$img.get(0).naturalHeight / this.$img.height());
    this.modal.toggleZoom();
    this.translate(dx, dy);
  }
}

class KeyboardHandler {
  constructor(modal) {
    this.modal = modal;
    this.ownerDocument = modal.ownerDocument;
  }

  bind() {
    $(this.ownerDocument).on(`keydown.${NAMESPACE}`, (e) => {
      this.keydown(e.keyCode, e.ctrlKey, e.shiftKey);
      e.preventDefault();
    });
  }

  unbind() {
    $(this.ownerDocument).off(`.${NAMESPACE}`);
  }

  keydown(keyCode, ctrl, shift) {
    switch(keyCode) {
    case 8:  // BACKSPACE
    case 34: // PAGE DOWN
    case 37: // <
      this.modal.prev();
      break;
    case 32: // SPACE
    case 33: // PAGE UP
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
    this.ownerDocument = modal.ownerDocument;
  }

  bind() {
    this.ownerDocument.addEventListener('wheel', WheelHandler.handler, { passive: false });
  }

  unbind() {
    this.ownerDocument.removeEventListener('wheel', WheelHandler.handler, { passive: false });
  }

  static handler(e) {
    e.preventDefault();
    SimpleLightbox.modals().forEach((modal) => {
      if (modal.zooming) {
        modal.imageView.wheel(e.deltaX, e.deltaY);
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
