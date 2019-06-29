describe('jquery-simple-lightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = __html__['index.html'];
    eval($('script').text());
  });

  function keydown(elem, code, ctrl = false, shift = false) {
    $(elem).trigger($.Event('keydown', { keyCode: code, ctrlKey: ctrl, shiftKey: shift }));
  }

  function drag(elem, moveX = 10, moveY = 10) {
    $(elem).trigger($.Event('mousedown', { pageX: 0, pageY: 0 }));
    $(elem).trigger($.Event('mousemove', { pageX: moveX, pageY: moveY }));
    $(elem).trigger($.Event('mouseup'));
  }

  function wheel(moveX = 10, moveY = 10) {
    let event = new WheelEvent('wheel', { deltaX: moveX, deltaY: moveY });
    document.dispatchEvent(event);
  }

  function wheelSupported() {
    var ua = window.navigator.userAgent.toLowerCase();
    return ua.indexOf('msie') == -1 && ua.indexOf('trident') == -1;
  }

  describe('basic', () => {
    let lightbox;
    let $basic, $links;
    let $modal, $img;

    beforeEach(() => {
      $basic = $('#basic');
      $links = $basic.find('a')
      $links.eq(0).click();
      $modal = $('body').find('.simple-lightbox');
      $img = $modal.find('.lb-content img');
      lightbox = $basic.data('simple-lightbox');
    });

    describe('open modal', () => {
      it('opens modal', () => {
        expect($modal.length).toEqual(1);
        expect($links.eq(0).hasClass('lb-current')).toEqual(true);
      });
    });

    describe('close modal', () => {
      it('closes modal by click', () => {
        $modal.find('.lb-close').click();
        expect($('body').find('.lb-modal').length).toEqual(0);
      });

      it('closes modal by keydown', () => {
        keydown(document, 27);
        expect($('body').find('.lb-modal').length).toEqual(0);
      });

      it('closes modal by clicking wrapper', () => {
        $modal.find('.lb-wrapper').click();
        expect($('body').find('.lb-modal').length).toEqual(0);
      });

      it('does not close by clicking content area', () => {
        $modal.find('.lb-content').click();
        expect($('body').find('.lb-modal').length).toEqual(1);
      });
    });

    describe('new window', () => {
      it('opens new window', () => {
        spyOn(window, 'open');
        $modal.find('.lb-window').click();
        expect(window.open).toHaveBeenCalled();
      });
    });

    describe('zoom', () => {
      it('zooms by click', () => {
        $modal.find('.lb-zoom').click();
        expect($modal.hasClass('lb-zooming')).toEqual(true);
      });

      it('zooms by double click', () => {
        $modal.find('img').dblclick();
        expect($modal.hasClass('lb-zooming')).toEqual(true);
      });

      it('zooms by keydown', () => {
        keydown(document, 13);
        expect($modal.hasClass('lb-zooming')).toEqual(true);
      });
    });

    describe('navi', () => {
      it('moves next and prev by click', () => {
        $modal.find('.lb-next').click();
        expect($links.eq(1).hasClass('lb-current')).toEqual(true);

        $modal.find('.lb-prev').click();
        expect($links.eq(0).hasClass('lb-current')).toEqual(true);
      });

      it('moves next and prev by keydown', () => {
        keydown(document, 39);
        expect($links.eq(1).hasClass('lb-current')).toEqual(true);

        keydown(document, 37);
        expect($links.eq(0).hasClass('lb-current')).toEqual(true);

        keydown(document, 33);
        expect($links.eq(1).hasClass('lb-current')).toEqual(true);

        keydown(document, 34);
        expect($links.eq(0).hasClass('lb-current')).toEqual(true);

        keydown(document, 32);
        expect($links.eq(1).hasClass('lb-current')).toEqual(true);

        keydown(document, 8);
        expect($links.eq(0).hasClass('lb-current')).toEqual(true);
      });

      it('moves next and prev by wheel', () => {
        if (!wheelSupported()) return;

        wheel(0, 1);
        expect($links.eq(1).hasClass('lb-current')).toEqual(true);

        wheel(0, -1);
        expect($links.eq(0).hasClass('lb-current')).toEqual(true);
      });
    });

    describe('window resize', () => {
      beforeEach(() => {
        lightbox.imageView.transX = 10;
        $(window).trigger('resize');
      });
      
      it('initializes image by resize', () => {
        expect(lightbox.imageView.transX).toEqual(0);
      });
    });

    describe('transform', () => {
      beforeEach(() => {
        $modal.find('.lb-zoom').click();
      });

      it('transforms image by drag', () => {
        drag($img, 10, 10);
        expect(lightbox.imageView.transX).toEqual(10);
      });

      it('transforms image by wheel', () => {
        if (!wheelSupported()) return;

        wheel(10, 10);
        expect(lightbox.imageView.transX).toEqual(10);
      });
    });
  });

  describe('destroy', () => {
    let $basic;

    beforeEach(() => {
      eval($('script').text());
      $basic = $('#basic');
      $basic.data('simple-lightbox').destroy();
    });

    it('destroys existing object', () => {
      expect($._data($basic.get(0), 'events')).toEqual(undefined);
    });
  });
});
