const scaffolder = {
    chart: function(d,j){
        let chart,i = 0,p,s = ``,t = d.name,v;

        d.format = d.format || {};

        if(d.data){
            if(d.data.length){
                switch(d.format.type){
                    case 'donut':
                        chart = new DonutChart({width: d.format.width, height: d.format.height, json: d});
                        break;
                    case 'bar':
                        chart = new BarChart({width: d.format.width, height: d.format.height, json: d});
                        break;
                    case 'stackedBar':
                        chart = new StackedBarChart({width: d.format.width, height: d.format.height, json: d});
                        break;
                    case 'barLine':
                        chart = new BarLineChart({width: d.format.width, height: d.format.height, json: d});
                        break;
                    case 'stackedArea':
                        chart = new StackedAreaChart({width: d.format.width, height: d.format.height, json: d});
                        break;
                    case 'stackedNegativeBar':
                        chart = new StackedNegativeBarChart({width: d.format.width, height: d.format.height, json: d});
                        break;
                    case 'groupedBar':
                        chart = new GroupedBarChart({width: d.format.width, height: d.format.height, json: d});
                        break;
                }

                if(!chart){
                    console.log('No Chart Created for : ',d.format.type);
                }
            }
        }

        return {
            html: `<title>${t}</title><chart> class="${d.format.type}" </chart>`,
            postRender:{index:j, chart: chart}, 
            size: d.size || 1
        };
    },
    grid: function(d,j){
        return {
            html: `<title>${d.name}</title><gg></gg>`,
            size: d.size || 1,
            postRender: {
                index: j,
                grid: new GGrid({
                    autoInit: false,
                    containerEl: null,
                    containerHeight: 476,
                    content: d.data,
                    preferences: {
                        firstColumn: {
                            addRowId: false,
                            sticky: false
                        },
                        mouse: {
                            hoverHighlightColumn: true,
                            hoverHighlightRow: true,
                            clickToggleCell: true,
                            editableCells: false,
                            preventRightClick: true,
                            rigthClickHighlightColumn: true,
                            rigthClickHighlightRow: true
                        },
                        prettyNumbers: true,
                        sort: {
                            sortable: true,
                            sortNumericDown: true //By default (true) will sort from largest
                        },
                        sumColumnValues: {
                            enable: true,
                            replaceAlphanumericWith: '',
                            replaceFirstCelWith: 'Total'
                        }
                    }
                })
            }
        }
    },
    pair: function(d,j){
        let i = 0, p, s = ``,t = d.name, v;

        for(i; i < d.data.lenght; i++){
            p = d.data[i].property;
            v = formatter.format(d.data[i].value, d.data[i].format);
            s += `<row><property>${p}</property><value>${v}</value></row>`
        }

        return {
            html: `<title>${t}</title><pair>${s}</pair>`,
            postRender: {index: j},
            size: d.size || 1
        };
    }
}