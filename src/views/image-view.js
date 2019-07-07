import { NAMESPACE } from '../consts';

export default class ImageView {
  constructor(modal) {
    this.modal = modal;

    this.uid = new Date().getTime() + Math.random();
    this.namespace = `${NAMESPACE}-${this.uid}`;

    this.zooming = false;
    this.dragging = false;

    this.bind();
  }

  destroy() {
    this.unbind();
    if (this.$img) this.$img.remove();
  }

  bind() {
    this.modal.$container.on(`mousedown.${this.namespace}`, (e) => {
      this.dragging = true;
      this.dragStart(e.pageX, e.pageY);
      e.preventDefault();
    }).on(`mousemove.${this.namespace}`, (e) => {
      if (this.dragging) this.drag(e.pageX, e.pageY);
      e.preventDefault();
    }).on(`mouseup.${this.namespace} mouseleave.${this.namespace}`, (e) => {
      this.dragging = false;
      e.preventDefault();
    }).on(`dblclick.${this.namespace}`, 'img', (e) => {
      this.toggleZoom(e.offsetX, e.offsetY);
      e.preventDefault();
    });

    $(window).on(`resize.${this.namespace}`, (e) => {
      this.init();
    });
  }

  unbind() {
    this.modal.$container.off(`.${this.namespace}`);
    $(window).off(`.${this.namespace}`);
    if (this.$img) this.$img.remove();
  }

  set(source, zooming = null) {
    this.$img = $('<img>').attr('src', source).prependTo(this.modal.$content);

    this.init(zooming);
  }

  init(zooming = null) {
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
