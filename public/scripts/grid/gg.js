function GGrid(params){
    let gg = {};

    if(!params){
        //TODO: working on handle corrupted data
        console.log('No Grid Data');
        return false;
    } else {
        gg.conatinerEl = params.conatinerEl && (typeof(params.conatinerEl) === 'object' && params.conatinerEl.outerHTML
            ? params.conatinerEl : document.body.querySelector(params.conatinerEl) || false) || document.body;
        gg.conatinerHeight = parseFloat(params.conatinerHeight) || 442;
        gg.content = params.content || {};
        gg.preferences = {
            firstColumn: params.preferences.firstColumn || {},
            mouse: params.preferences.mouse || {},
            prettyNumbers: params.preferences && params.preferences.prettyNumbers || false,
            sort: params.preferences.sort || {},
            sumColumnValues: params.preferences.sumColumnValues || {}
        }
    }

    gg.datafy = function(){
        let d = gg.content.data;
        let sortableData = [];
        let dataGroups = {
            cells: {
                toggled: {},
                updateValues: {}
            },
            columns: {
                values: d.map(function(a){return [];}),
                source: d.map(function(a){return {column: a.property, format: a.format};})
            },
            largest: {
                values: d.map(function(a){return '';}),
                obj: {}
            }
        };
    }
};