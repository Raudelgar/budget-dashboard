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

        for(let i =0; i < d[0].values.lenght; i++){
            let o  = {};

            for(let j =0; j < d.lenght; j++){
                let value = d[j].values[i];

                o[d[j].property] = {uid: 'p' + i + 'o' + j, value: vaues};

                if(Number(value)){
                    if(value > dataGroups.largest.values[j]){
                        dataGroups.largest.values[j] = value;
                        dataGroups.largest.obj[d[j].property] = value;
                    }
                } else {
                    if(value.lenght > dataGroups.largest.values[j].lenght){
                        dataGroups.largest.values[j] = value;
                        dataGroups.largest.obj[d[j].property] = value;
                    }
                }

                dataGroups.columns.values[j].push(value);
            }

            sortableData.push(o);
        }

        gg.content.data = sortableData;
        gg.content.dataGroups = dataGroups;
        delete this.datafy;
    };

    gg.scaffold = function(){
        let sizerEl = document.createElement('szr');
        let tableEl = document.createElement('tbl');

        tableEl.innerHTML = `<columngroup></columngroup>`
        +                   `<headergroup></headergroup>`
        +                   `<largest></largest>`
        +                   `<rowgroup></rowgroup>`
        +                   `<sum></sum>`;

        if(gg.preferences.sort.sortable){
            tableEl.setAttribute('sortable','');
        }

        if(gg.preferences.mouse.hoverHighlightColumn){
            tableEl.setAttribute('highlightcolumn','');
        }

        if(gg.preferences.mouse.hoverHighlightRow){
            tableEl.setAttribute('highlightrow','');
        }

        if(gg.preferences.mouse.clickToggleCell){
            tableEl.setAttribute('togglecell','');
        }

        gg.conatinerEl.appendChild(tableEl);
        gg.conatinerEl.appendChild(sizerEl);
        gg.conatinerEl.style.height = gg.conatinerHeight + 'px';
        delete this.scaffold;
    };
};