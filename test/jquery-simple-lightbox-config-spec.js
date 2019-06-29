describe('jquery-simple-lightbox', () => {
  it('config', () => {
    let defaults = $.SimpleLightbox.getDefaults();
    expect(defaults.owner).toEqual('body');

    defaults = $.SimpleLightbox.setDefaults({owner: 'div'});
    expect(defaults.owner).toEqual('div');
  });
});
