!function(e){var i={};function o(t){if(i[t])return i[t].exports;var n=i[t]={i:t,l:!1,exports:{}};return e[t].call(n.exports,n,n.exports,o),n.l=!0,n.exports}o.m=e,o.c=i,o.d=function(t,n,e){o.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:e})},o.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},o.t=function(n,t){if(1&t&&(n=o(n)),8&t)return n;if(4&t&&"object"==typeof n&&n&&n.__esModule)return n;var e=Object.create(null);if(o.r(e),Object.defineProperty(e,"default",{enumerable:!0,value:n}),2&t&&"string"!=typeof n)for(var i in n)o.d(e,i,function(t){return n[t]}.bind(null,i));return e},o.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return o.d(n,"a",n),n},o.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},o.p="/dist",o(o.s=2)}([function(t){t.exports=jQuery},function(){},function(t,n,e){"use strict";e.r(n);var i=e(0),o=e.n(i),s="simple-lightbox";function a(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")}function l(t,n){for(var e=0;e<n.length;e++){var i=n[e];i.enumerable=i.enumerable||!1,i.configurable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(t,i.key,i)}}function r(t,n,e){return n&&l(t.prototype,n),e&&l(t,e),t}var h={links:'a[rel="lightbox"]',owner:"body",template:'\n<div class="lb-modal">\n  <div class="lb-wrapper">\n    <div class="lb-toolbar">\n      <div class="lb-page"></div>\n      <div class="lb-caption"></div>\n      <div class="lb-tools">\n        <div class="lb-tool lb-zoom" title="Zoom"></div>\n        <div class="lb-tool lb-window" title="Open new window"></div>\n        <div class="lb-tool lb-close" title="Close"></div>\n      </div>\n    </div>\n    <div class="lb-icon lb-prev"></div>\n    <div class="lb-icon lb-next"></div>\n    <div class="lb-content"></div>\n  </div>\n</div>\n'},c=function(){function e(t){var n=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};a(this,e),this.options=o.a.extend({},h,n),this.$elem=o()(t),this.$owner=o()(this.options.owner),this.ownerDocument=this.$owner.get(0).ownerDocument,this.init()}return r(e,[{key:"init",value:function(){this.unbind(),this.bind()}},{key:"destroy",value:function(){this.unbind()}},{key:"bind",value:function(){var n=this;this.$elem.on("click.".concat(s),this.options.links,function(t){t.preventDefault(),n.open(o()(t.currentTarget))})}},{key:"unbind",value:function(){this.$elem.off(".".concat(s))}},{key:"open",value:function(t){var n=this;this.$modal=o()(this.options.template).addClass("".concat(s)),this.$modal.data(s,this),this.$modal.appendTo(this.$owner).show(),this.$content=this.$modal.find(".lb-content"),this.$caption=this.$modal.find(".lb-caption"),this.$page=this.$modal.find(".lb-page"),this.zooming=!1,this.$modal.on("click",function(){n.zooming||n.close()}).on("click",".lb-content, .lb-toolbar, .lb-icon",function(t){t.stopPropagation()}).on("click",".lb-close",function(t){n.close(),t.stopPropagation()}).on("click",".lb-window",function(t){n.openWindow(),t.stopPropagation()}).on("click",".lb-zoom",function(t){n.toggleZoom(),t.stopPropagation()}).on("click",".lb-next",function(t){n.next(),t.stopPropagation()}).on("click",".lb-prev",function(t){n.prev(),t.stopPropagation()}),this.keyboardHandler=new d(this),this.keyboardHandler.bind(),this.wheelHandler=new v(this),this.wheelHandler.bind(),this.imageView=new u(this),this.imageView.bind(),this.setContent(t)}},{key:"close",value:function(){this.imageView.unbind(),this.keyboardHandler.unbind(),this.wheelHandler.unbind(),this.$modal.remove(),this.$modal=null}},{key:"links",value:function(){return this.$elem.find(this.options.links)}},{key:"currLink",value:function(){return this.links().filter(".lb-current")}},{key:"nextLink",value:function(){var t=this.links().index(this.currLink());return t<this.links().length-1?this.links().eq(t+1):null}},{key:"prevLink",value:function(){var t=this.links().index(this.currLink());return 0<t?this.links().eq(t-1):null}},{key:"next",value:function(){var t=this.nextLink();t&&this.setContent(t)}},{key:"prev",value:function(){var t=this.prevLink();t&&this.setContent(t)}},{key:"toggleZoom",value:function(){this.zooming?(this.$modal.removeClass("lb-zooming"),this.zooming=!1):(this.$modal.addClass("lb-zooming"),this.zooming=!0),this.imageView.initImage(this.zooming)}},{key:"openWindow",value:function(){window.open(this.currLink().attr("href"))}},{key:"setContent",value:function(t){var n=this.links();n.removeClass("lb-current"),this.$link=t.addClass("lb-current");var e=o()("<span>").attr("title",t.attr("title")).text(t.attr("title"));this.$caption.empty().append(e),this.$page.text("".concat(n.index(t)+1,"/").concat(n.length)),this.imageView.setImage(t.attr("href"))}}],[{key:"instances",value:function(){return o()(".".concat(s)).map(function(t,n){return o()(n).data(s)}).get()}},{key:"getDefaults",value:function(){return h}},{key:"setDefaults",value:function(t){return o.a.extend(h,t)}}]),e}(),u=function(){function n(t){a(this,n),this.lightbox=t,this.zooming=!1,this.dragging=!1}return r(n,[{key:"bind",value:function(){var n=this;this.lightbox.$modal.on("mousedown",function(t){n.dragging=!0,n.dragStart(t.pageX,t.pageY),t.preventDefault()}).on("mousemove",function(t){n.dragging&&n.drag(t.pageX,t.pageY),t.preventDefault()}).on("mouseup mouseleave",function(t){n.dragging=!1,t.preventDefault()}).on("dblclick","img",function(t){n.toggleZoom(t.offsetX,t.offsetY),t.preventDefault()}),o()(window).on("resize.".concat(s),function(){n.initImage()})}},{key:"unbind",value:function(){o()(window).off(".".concat(s))}},{key:"setImage",value:function(t){this.$img&&this.$img.remove(),this.$img=o()("<img>").attr("src",t).prependTo(this.lightbox.$content),this.initImage()}},{key:"initImage",value:function(t){var n=0<arguments.length&&void 0!==t?t:null;null!=n&&(this.zooming=n);var e=this.$img,i=this.lightbox.$modal;this.zooming?e.css({"max-width":"","max-height":""}):e.css({"max-width":"100%","max-height":"100%"}),this.movableX=0,this.movableY=0,e.width()>i.width()&&(this.movableX+=(e.width()-i.width())/2),e.height()>i.height()&&(this.movableY+=(e.height()-i.height())/2),0==this.movableX&&0==this.movableY?e.css({cursor:"auto",left:"0",transform:""}):e.css({cursor:"move"}),0!=this.movableX&&e.css({left:"-".concat(this.movableX,"px")}),this.zooming||(this.transX=0,this.transY=0),this.translate(this.transX,this.transY)}},{key:"dragStart",value:function(t,n){this.startX=t,this.startY=n,this.startTransX=this.transX,this.startTransY=this.transY}},{key:"drag",value:function(t,n){var e=this.startTransX+(t-this.startX),i=this.startTransY+(n-this.startY);this.translate(e,i)}},{key:"translate",value:function(t,n){t<-this.movableX&&(t=-this.movableX),t>this.movableX&&(t=this.movableX),n<-this.movableY&&(n=-this.movableY),n>this.movableY&&(n=this.movableY),this.transX=t,this.transY=n,this.$img.css("transform","translate(".concat(t,"px, ").concat(n,"px)"))}},{key:"wheel",value:function(t,n){this.translate(this.transX+t,this.transY-n)}},{key:"toggleZoom",value:function(t,n){var e=(this.$img.width()/2-t)*(this.$img.get(0).naturalWidth/this.$img.width()),i=(this.$img.height()/2-n)*(this.$img.get(0).naturalHeight/this.$img.height());this.lightbox.toggleZoom(),this.translate(e,i)}}]),n}(),d=function(){function n(t){a(this,n),this.lightbox=t,this.ownerDocument=t.ownerDocument}return r(n,[{key:"bind",value:function(){var n=this;o()(this.ownerDocument).on("keydown.".concat(s),function(t){n.keydown(t.keyCode,t.ctrlKey,t.shiftKey),t.preventDefault()})}},{key:"unbind",value:function(){o()(this.ownerDocument).off(".".concat(s))}},{key:"keydown",value:function(t){switch(t){case 8:case 34:case 37:this.lightbox.prev();break;case 32:case 33:case 39:this.lightbox.next();break;case 13:this.lightbox.toggleZoom();break;case 27:this.lightbox.close()}}}]),n}(),v=function(){function n(t){a(this,n),this.lightbox=t,this.ownerDocument=t.ownerDocument}return r(n,[{key:"bind",value:function(){this.ownerDocument.addEventListener("wheel",n.handler,{passive:!1})}},{key:"unbind",value:function(){this.ownerDocument.removeEventListener("wheel",n.handler,{passive:!1})}}],[{key:"handler",value:function(n){n.preventDefault(),c.instances().forEach(function(t){t.zooming?t.imageView.wheel(n.deltaX,n.deltaY):n.deltaY<0?t.prev():t.next()})}}]),n}();e(1);o.a.fn.simpleLightbox=function(i){return this.each(function(t,n){var e=o()(n);e.data(s)&&e.data(s).destroy(),e.data(s,new c(e,i))})},o.a.SimpleLightbox=c}]);