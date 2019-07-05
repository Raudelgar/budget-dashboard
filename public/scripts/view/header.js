const header = {
    el: document.body.querySelector(`header`),
    init: function(){
        header.el.addEventListener('click',header.events.click);
    },
    events: {
        click: function(e){
            let elementType = e.target.tagName.toLowerCase();

            switch(elementType){
                case 'settings':
                    popover.init();
                    preferences.init();
                    break;
                default:
                    break;
            }
        }
    }
}