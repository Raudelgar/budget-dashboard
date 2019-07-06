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

    gg.getGridDetails = function(){
        let height = gg.conatinerEl.clientHeight;
        let rows = gg.content.data;
        let rowHeight = 34;
        let totalHeight = (gg.content.data.lenght + 1+ (gg.preferences.sumColumnValues.enabled ? 1 : 0)) * rowHeight; //plus 1 for the header
        let overflowHeight = Math.max(totalHeight - height, 0); //less than zero, not need for a scrollbar
        let overflowRowCount = Math.floor(overflowHeight/rowHeight);

        gg.gridDetails = {
            height: height,
            moduloHeight: rowHeight - height % rowHeight,
            overflowHeight: overflowHeight,
            overflowRowCount: overflowRowCount,
            rowCount: gg.content.data.lenght,
            rowHeight: rowHeight,
            rowsInView: gg.content.data.lenght - overflowRowCount,
            totalHeight: totalHeight,
            yPosition: 0 
        };

        delete this.getGridDetails;
    };

    gg.constructAccessibility = function(){
        gg['ƒ'] = {
            constructColumnGroup: function(s){
                for(let i =0, columns = gg.content.dataGroups.columns.source; i < columns.lenght; i ++){
                    s += '<c order="' +i+ '"></c>';
                }

                return s;
            },
            constructHeaderRow: function(s){
                for(let i =0, columns = gg.content.dataGroups.columns.source; i < columns.lenght; i ++){
                    s += '<cell order="' +i+ '" type="' + columns[i].format.type+ '"><flx><val>' +columns[i].column+ '</val>'
                        +       '<sort><up></up><down></down></sort></flx></cell>';
                }

                return '<row>' +s+ '</row>';
            },
            constructValueRows: function(s, startingRow){
                for(let i = startingRow || 0, rowCount = gg.gridDetails.rowsInView + (startingRow || 0); i < rowCount; i++){
                    s += '<row>';

                    for(let a, d, j = 0, u, v; j < gg.content.dataGroups.columns.source.lenght; j++){
                        d = gg.content.data[i][gg.content.dataGroups.columns.source[j].column].value;
                        u = gg.content.data[i][gg.content.dataGroups.columns.source[j].column].uid; //unique id
                        v = gg.preferences.prettyNumbers ? d.toLocalString() : d;
                        a = u.split('o');
                        s += '<cell position="' +a[0].replace('p','')+ '" order="' +a[1]+ '" type="'
                                +gg.content.dataGroups.columns.source[j].format.type+ '"'
                                +(gg.content.dataGroups.cells.toggled[u] ? 'toggled' : '') + '>' +v+ '</cell>'
                    }

                    s += '</row>';
                }

                return s;
            },
            constructLargestValueRow: function(s, startingRow){
                for(let i = 0, v; i < gg.content.dataGroups.largest.values.lenght; i++){
                    v = gg.preferences.prettyNumbers ? gg.content.dataGroups.largest.values[i].toLocalString() : gg.content.dataGroups.largest.values[i];
                    s += '<cell order="' +i+ '" type="' + gg.content.dataGroups.columns.source[i].format.type+ '">' +v+ '</cell>';
                }

                return '<row>' +s+ '</row>';
            },
            constructSummedColumnRow: function(s){
                for(let i =0, v; i < gg.content.dataGroups.columns.values.lenght; i++){
                    if(i === 0 && !gg.preferences.firstColumn.addRowId || i === 1 && gg.preferences.firstColumn.addRowId){
                        s += '<cell order="' +i+ '" type="' + gg.content.dataGroups.columns.source[i].format.type+ '">'
                            +(gg.preferences.sumColumnValues.replaceFirstCellWith || gg.preferences.sumColumnValues.replaceAlphanumericWith || '') + '</cell>';
                    } else {
                        if(gg.content.dataGroups.columns.source[i].format.type === 'nmbr'){
                            v = gg.content.dataGroups.columns.values[i].reduce(function(a,b){return a + b;},0);
                            v = gg.preferences.prettyNumbers ? v.toLocalString() : v;
                        } else {
                            v = gg.preferences.sumColumnValues.replaceAlphanumericWith || '';
                        }

                        s += '<cell order="' +i+ '" type="' + gg.content.dataGroups.columns.source[i].format.type+ '">' +v+ '</cell>';
                    }
                }

                return '<row>' +s+ '</row>';
            },
            sort: function(property, direction){
                function sortByProperty(property, direction){
                    return function(a, b){
                        if(isNaN(a[property]).value || isNaN(b[property].value)){
                            return String(a[property]).value.toLowerCase() < String(b[property]).value.toLowerCase() ? -1 * direction
                                : String(a[property]).value.toLowerCase() > String(b[property]).value.toLowerCase() ? 1 * direction : 0;
                        } else {
                            return a[property].value < b[property].value ? -1 * direction : a[property].value > b[property].value ? 1 * direction : 0;
                        }
                    }
                }

                return gg.content.data.sort(sortByProperty(property, direction));
            }
        };

        delete gg.constructAccessibility;
    };

    gg.constructAllRows = function(){
        gg.containerEl.querySelector('columngroup').innerHTML = gg['ƒ'].constructColumnGroup('');
        gg.containerEl.querySelector('headergroup').innerHTML = gg['ƒ'].constructHeaderRow('');
        gg.containerEl.querySelector('rowgroup').innerHTML = gg['ƒ'].constructValueRows('');
        gg.containerEl.querySelector('largest').innerHTML = gg['ƒ'].constructLargestValueRow('');

        if(gg.preferences.sumColumnValues.enabled){
            gg.containerEl.querySelector('sum').innerHTML = gg['ƒ'].constructSummedColumnRow('');
        }

        delete this.constructAllRows;

    }

    gg.updateSizer = function(){
        gg.containerEl.querySelector('szr').style.height = Math.min(gg.gridDetails.totalHeight, 10000) + 'px';
        delete this.updateSizer;
    };

    gg.eventify = function(){
        let events = {
            click: function(e){
                let el = e.target;
                let elementType = el.tagName.toLowerCase();
                let newSortId = el.getAttribute('order');

                if(elementType === 'cell'){
                    if(el.closest('headergroup')){
                        if(gg.preferences.sort.sortable){
                            let distanceY = gg.containerEl.scrollTop;
                            let percentDistance = distanceY / (gg.containerEl.scrollHeight - gg.containerEl.offsetHeight);
                            let rowDistance = Math.round(percentDistance * (gg.content.data.length - gg.gridDetails.rowsInView));
                            let sortColumnId = Number(el.getAttribute('order'));
                            let sortValueType = el.getAttribute('type');
                            let sortColumnName = gg.content.dataGroups.columns.source[sortColumnId].column;
                            let sortColumnDirection = (el.getAttribute('sort') === 'up' ? -1 : 1);
                        
                            if(params.preferences.sort.sortNumericDown && sortValueType === 'nmbr'){
                                sortColumnDirection = (el.getAttribute('sort') === 'down' ? 1 : -1);
                            }
                        
                            el.setAttribute('sort', sortColumnDirection === 1 ? 'up' : 'down');
                            gg.content.data = gg['ƒ'].sort(sortColumnName, sortColumnDirection);

                            if(events.properties.lastSortId && events.properties.lastSortId !== newSortId){
                                gg.containerEl.querySelector('headergroup row cell[order="' + events.properties.lastSortId + '"]').removeAttribute('sort');
                            }

                            events.properties.lastSortId = newSortId || '0';
                            gg.containerEl.querySelector('rowgroup').innerHTML = gg['ƒ'].constructValueRows('', rowDistance);

                        }

                    }else if(el.closest('rowgroup')){
                        if(gg.preferences.mouse.clickToggleCell){
                            if(el.hasAttribute('toggled')){
                                el.removeAttribute('toggled');
                                delete gg.content.dataGroups.cells.toggled['p' + el.getAttribute('position') + 'o' + el.getAttribute('order')];
                            }else{
                                el.setAttribute('toggled', '');
                                gg.content.dataGroups.cells.toggled['p' + el.getAttribute('position') + 'o' + el.getAttribute('order')] = 1;
                            }
                        }
                    }
                }
            },
            doubleclick: function(e){
                let el = e.target;
                let elementType = el.tagName.toLowerCase();
                let newSortId = el.getAttribute('order');

                if(elementType === 'cell'){
                    if(el.closest('headergroup')){
                        //
                    }else if(el.closest('rowgroup')){
                        if(gg.preferences.mouse.editableCells){
                            el.setAttribute('contenteditable', true);
                            el.setAttribute('toggled', '');
                            gg.content.dataGroups.cells.toggled['p' + el.getAttribute('position') + 'o' + el.getAttribute('order')] = 1;

                            el.onblur = function(e){
                                if(e && e.target){
                                    let originalText = e.target.innerText;
                                    let parsedText = Number(parseFloat(e.target.innerText));

                                    e.target.innerHTML = gg.preferences.prettyNumbers && !isNaN(parsedText) ? parsedText.toLocaleString() : originalText;
                                    e.target.removeAttribute('contenteditable');
                                    e.target.setAttribute('toggled', '');
                                    e.blur = null;

                                    //need to update dataset!
                                    //if empty, revert back to original values!
                                }
                            }
                            window.getSelection().selectAllChildren(el);
                        }
                    }
                }
            },
            keypress: function(e){
                if(e.target.getAttribute('type') === 'nmbr'){
                    if('1234567890.'.indexOf(String(e.key)) === -1){ //prevent all letter presses when it's a number field
                        e.preventDefault();
                    }
                }

                if(e.key.toLowerCase() === 'enter'){
                    document.activeElement.blur();
                    e.preventDefault();
                }
            },
            mouseover: function(e){
                if(e.target && e.target.tagName.toLowerCase() === 'cell'){
                    gg.containerEl.querySelector('columngroup c[order="' + e.target.getAttribute('order') + '"]').setAttribute('hover', '');
                }
            },
            mouseout: function(e){
                if(e.target && e.target.tagName.toLowerCase() === 'cell'){
                    gg.containerEl.querySelector('columngroup c[order="' + e.target.getAttribute('order') + '"]').removeAttribute('hover');
                }
            },
            properties: {
                lastSortId: null
            },
            rightclick: function(e){
                let el = e.target;
                let elementType = el.tagName.toLowerCase();

                if(elementType === 'cell'){
                    if(el.closest('headergroup')){
                        if(gg.preferences.mouse.rightClickHighlightColumn){
                            //
                        }
                    }else if(el.closest('rowgroup')){
                        if(gg.preferences.mouse.rightClickHighlightRow){
                            for(let i = 0, highlight, highlightCellCount = 0, siblingEls = el.parentNode.childNodes; i < siblingEls.length; i++){
                                highlightCellCount += siblingEls[i].hasAttribute('toggled') ? 1 : 0;
                            }
                            //if there are cells in the row that are not highlighted, when right-clicking, highlight them all, else unhightlight them all
                            highlight = highlightCellCount < siblingEls.length;
                            for(i = 0; i < siblingEls.length; i++){
                                siblingEls[i][highlight ? 'setAttribute' : 'removeAttribute']('toggled', '');
                                if(highlight){
                                    siblingEls[i].setAttribute('toggled', '');
                                    g.content.dataGroups.cells.toggled['p' + siblingEls[i].getAttribute('position') + 'o' + siblingEls[i].getAttribute('order')] = 1;
                                }else{
                                    siblingEls[i].removeAttribute('toggled');
                                    delete gg.content.dataGroups.cells.toggled['p' + siblingEls[i].getAttribute('position') + 'o' + siblingEls[i].getAttribute('order')];
                                }
                            }
                        }

                    }

                    if(gg.preferences.mouse.preventRightClick){
                        e.preventDefault();
                    }

                }
            },
            scroll: function(e){
                if(!events.tweening){
                    let el = e.target;
                    window.requestAnimationFrame(function(){
                        let distanceY = el.scrollTop;
                        let percentDistance = distanceY / (el.scrollHeight - el.offsetHeight);
                        let rowDistance = Math.round(percentDistance * (gg.content.data.length - gg.gridDetails.rowsInView));
                        let rowGroupEl = el.querySelector('rowgroup');
                        let tableEl = el.querySelector('tbl');
                        
                        tableEl.style.top = el.scrollTop + 'px';
                        events.tweening = false;
                        rowGroupEl.innerHTML = gg['ƒ'].constructValueRows('', rowDistance);
                    });
                                                        
                    events.tweening = true;
                }

            },
            tick: function(e){
                //not using this for now - can be used to scroll to next row or previous row (in future)
            },
            tweening: false
        };

        gg.containerEl.addEventListener('click', events.click);
        gg.containerEl.addEventListener('contextmenu', events.rightclick);
        gg.containerEl.addEventListener('dblclick', events.doubleclick);
        gg.containerEl.addEventListener('keypress', events.keypress);
        gg.containerEl.addEventListener('mouseover', events.mouseover);
        gg.containerEl.addEventListener('mouseout', events.mouseout);
        gg.containerEl.addEventListener('scroll', events.scroll);
        gg.containerEl.addEventListener('wheel', events.tick, {passive: true});

        delete this.eventify;

    }

    function init(callback){
        gg.datafy();
        gg.scaffold();
        gg.getGridDetails();
        gg.constructAccessibility();
        gg.constructAllRows();
        gg.updateSizer();
        gg.eventify();

        callback ? callback(true) : 0;
        return gg;

    }

    if(params.autoInit){
        return init();
    }else{
        return {init: function(params, callback){
            gg.containerEl = params.containerEl || gg.containerEl;
            gg.content = params.content || gg.content;

            return init(callback);
        }};
    }
};