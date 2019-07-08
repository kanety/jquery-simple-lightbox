describe('jquery-simple-lightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = __html__['index.html'];
    eval($('script').text());
  });

  describe('iframe-view', () => {
    let $links, $container;
    let lightbox, view;

    beforeEach((done) => {
      $links = $('#iframe').find('a');
      $links.eq(0).click();

      lightbox = $('#iframe').data('simple-lightbox');
      view = lightbox.modal.view;

      $container = lightbox.modal.$container;
      $container.find('iframe').on('load', () => {
        done();
      });
    });

    describe('moves', () => {
      beforeEach(() => {
        $container.find('.lb-next').click();
      });

      it('moves to next', () => {
        expect($links.eq(1).hasClass('lb-current')).toEqual(true);
      });
    });

    describe('moves', () => {
      beforeEach(() => {
        $container.find('.lb-zoom').click();
        $container.find('.lb-next').click();
      });

      it('moves while zooming', () => {
        expect($links.eq(1).hasClass('lb-current')).toEqual(true);
      });
    });

    describe('window resize', () => {
      beforeEach(() => {
        $(window).trigger('resize');
      });

      it('calls fit', () => {
        expect($container.find('iframe').attr('scrolling')).toEqual('no');
      });
    });

    describe('zoom', () => {
      beforeEach(() => {
        $container.find('.lb-zoom').click();
      });

      it('calls full', () => {
        expect($container.find('iframe').attr('scrolling')).toEqual('auto');
      });
    });
  });
});
