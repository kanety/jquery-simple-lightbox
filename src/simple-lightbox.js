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
    this.$owner = $(this.options.owner);
    this.ownerDocument = this.$owner.get(0).ownerDocument;

    this.init();
  }

  init() {
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
    this.$modal = $(this.options.template).addClass(`${NAMESPACE}`);
    this.$modal.data(NAMESPACE, this);
    this.$modal.appendTo(this.$owner).show();

    this.$content = this.$modal.find('.lb-content');
    this.$caption = this.$modal.find('.lb-caption');
    this.$page = this.$modal.find('.lb-page');
    this.zooming = false;

    this.$modal.on('click', (e) => {
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

    this.keyboardHandler = new KeyboardHandler(this);
    this.keyboardHandler.bind();

    this.wheelHandler = new WheelHandler(this);
    this.wheelHandler.bind();
    
    this.imageView = new ImageView(this);
    this.imageView.bind();

    this.setContent($link);
  }

  close() {
    this.imageView.unbind();
    this.keyboardHandler.unbind();
    this.wheelHandler.unbind();

    this.$modal.remove();
    this.$modal = null;
  }

  links() {
    return this.$elem.find(this.options.links);
  }

  currLink() {
    return this.links().filter('.lb-current');
  }

  nextLink() {
    let index = this.links().index(this.currLink());
    if (index < this.links().length - 1) {
      return this.links().eq(index + 1);
    } else {
      return null;
    }
  }

  prevLink() {
    let index = this.links().index(this.currLink());
    if (index > 0) {
      return this.links().eq(index - 1);
    } else {
      return null;
    }
  }

  next() {
    let $next = this.nextLink();
    if ($next) this.setContent($next);
  }

  prev() {
    let $prev = this.prevLink();
    if ($prev) this.setContent($prev);
  }

  toggleZoom() {
    if (this.zooming) {
      this.$modal.removeClass('lb-zooming');
      this.zooming = false;
    } else {
      this.$modal.addClass('lb-zooming');
      this.zooming = true;
    }
    this.imageView.initImage(this.zooming);
  }

  openWindow() {
    window.open(this.currLink().attr('href'));
  }

  setContent($link) {
    let $links = this.links();
    $links.removeClass('lb-current');
    this.$link = $link.addClass('lb-current');

    let $cap = $('<span>').attr('title', $link.attr('title')).text($link.attr('title'))
    this.$caption.empty().append($cap);
    this.$page.text(`${$links.index($link) + 1}/${$links.length}`);

    this.imageView.setImage($link.attr('href'));
  }

  static instances() {
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

class ImageView {
  constructor(lightbox) {
    this.lightbox = lightbox;
    this.zooming = false;
    this.dragging = false;
  }

  bind() {
    this.lightbox.$modal.on('mousedown',  (e) => {
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
    this.$img = $('<img>').attr('src', source).prependTo(this.lightbox.$content);

    this.initImage();
  }

  initImage(zooming = null) {
    if (zooming != null) this.zooming = zooming;

    let $img = this.$img;
    let $modal = this.lightbox.$modal;

    if (this.zooming) {
      $img.css({ 'max-width': '', 'max-height': '' });
    } else {
      $img.css({ 'max-width': '100%', 'max-height': '100%' });
    }

    this.movableX = 0;
    this.movableY = 0;

    if ($img.width() > $modal.width()) {
      this.movableX += ($img.width() - $modal.width()) / 2;
    }
    if ($img.height() > $modal.height()) {
      this.movableY += ($img.height() - $modal.height()) / 2;
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
    this.lightbox.toggleZoom();
    this.translate(dx, dy);
  }
}

class KeyboardHandler {
  constructor(lightbox) {
    this.lightbox = lightbox;
    this.ownerDocument = lightbox.ownerDocument;
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
      this.lightbox.prev();
      break;
    case 32: // SPACE
    case 33: // PAGE UP
    case 39: // >
      this.lightbox.next();
      break;
    case 13: // ENTER
      this.lightbox.toggleZoom();
      break;
    case 27: // ESC
      this.lightbox.close();
      break;
    }
  }
}

class WheelHandler {
  constructor(lightbox) {
    this.lightbox = lightbox;
    this.ownerDocument = lightbox.ownerDocument;
  }

  bind() {
    this.ownerDocument.addEventListener('wheel', WheelHandler.handler, { passive: false });
  }

  unbind() {
    this.ownerDocument.removeEventListener('wheel', WheelHandler.handler, { passive: false });
  }

  static handler(e) {
    e.preventDefault();
    SimpleLightbox.instances().forEach((inst) => {
      if (inst.zooming) {
        inst.imageView.wheel(e.deltaX, e.deltaY);
      } else {
        if (e.deltaY < 0) {
          inst.prev();
        } else {
          inst.next();
        }
      }
    });
  }
}
