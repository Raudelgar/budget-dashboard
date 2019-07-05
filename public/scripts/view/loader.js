const loader = {
    el: document.querySelector(`loader`),
    init: function(){
        loader.scaffold();
        loader.show();
    },
    scaffold: function(){
        loader.el.innerHTML =   '<modal>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                           '<square></square>'
        +                       '</modal>'
    },
    show: function(){
        window.requestAnimationFrame(function(){
            loader.el.setAttribute('loading','');
        });
    },
    hide: function(){
        loader.el.removeAttribute('loading');
    },
    remove: function(){
        window.requestAnimationFrame(function(){
            loader.el.parentNode.removeChild(loader.el);
        });
    },
    fini: function(){
        loader.hide();
    }
}