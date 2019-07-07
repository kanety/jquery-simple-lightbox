import { drag, wheel, wheelSupported } from '../helper'

describe('jquery-simple-lightbox', () => {
  beforeEach(() => {
    document.body.innerHTML = __html__['index.html'];
    eval($('script').text());
  });

  describe('image-view', () => {
    let $links, $container;
    let lightbox;

    beforeEach(() => {
      $links = $('#basic').find('a');
      $links.eq(0).click();

      lightbox = $('#basic').data('simple-lightbox');
      $container = lightbox.modal.$container;
    });

    it('moves', () => {
      $container.find('.lb-next').click().click();
      expect($links.eq(2).hasClass('lb-current')).toEqual(true);
    });

    it('moves while zooming', () => {
      $container.find('.lb-zoom').click();
      $container.find('.lb-next').click().click();
      expect($links.eq(2).hasClass('lb-current')).toEqual(true);
    });

    describe('window resize', () => {
      beforeEach(() => {
        lightbox.modal.view.transX = 10;
        $(window).trigger('resize');
      });
      
      it('initializes image by resize', () => {
        expect(lightbox.modal.view.transX).toEqual(0);
      });
    });

    describe('drag', () => {
      beforeEach((done) => {
        $container.find('.lb-zoom').click();
        let $img = $container.find('img');
        $img.on('mouseup', () => {
          setTimeout(() => {
            done();
          }, 500);
        });
        drag($img, 10, 10);
      });

      it('transforms', () => {
        expect(lightbox.modal.view.transX).toEqual(10);
      });
    });

    if (wheelSupported()) {
      describe('wheel', () => {
        beforeEach(() => {
          $container.find('.lb-zoom').click();
          wheel(10, 10);
        });

        it('transforms', () => {
          expect(lightbox.modal.view.transX).toEqual(10);
        });
      });
    }
  });
});
