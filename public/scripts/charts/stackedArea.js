function StackedAreaChart(params) {
    let o = {
        init: function(element, width, height, json, callback){
			let margin = 40; //svg margin
			let bottomSpacing = 0;
			let legendHeight = 0;
			let xAxisHeight = 0;
			let yAxisWidth = 0;
            let stackWidth = 0;
			let yMaxValue;
			let stack;
            let metaData;
            let dataSet;
            let svg;

			element = typeof element === 'string' ? document.body.querySelector(element) : element;
			width = Math.ceil(element.getBoundingClientRect().width) - margin;
            height = Math.ceil(element.getBoundingClientRect().height) - margin;
			o.el = element;

			if(width < 0 && height < 0){
                return;
            }

            metaData = json.format;
			dataSet = {
                columns: (function(){
                    let a = [];
                    for (let i = 0; i < json.data.length; i++){
                        let tmp = Object.keys(json.data[i].values);
                        a = tmp.length > a.length ? tmp : a;
                    }

                    return a;
                })(),
                label: (function() {
                    let a = [];
    
                    for (let i = 0; i < json.data.length; i++){
                        //this will convert the date format on the labels from the database
                        let time = new Date(json.data[i].label).getTime();
                        let date = formatter.formatDate(time, 'MMM-YYYY').toUpperCase();
                        a.push(date);
                    }
                    return a;
                })()
            };

            //Storing legend column active
            dataSet.columnsActive = (function() {
                let o = {};
                dataSet.columns.map(c => {
                    o[c] = true;
                });
                return o;
            })();
            

            // dataSet.content= (function() {
            //     let a = [];

            //     for (let i = 0; i < json.data.length; i++) {
            //         // let keys = Object.keys(json.data[i].values);
            //         let keys = dataSet.columns;

            //         for (let k of keys) {
            //             let o = {};

            //             o.label = dataSet.label[i];
            //             o.index = i;

            //             o.legend = k;
            //             //This will add the missing objects into the values object with value null
            //             if (json.data[i].values[k]) {
            //                 o.val = json.data[i].values[k]; //To keep null values as null
            //             } else {
            //                 o.val = null;
            //             }
            //             a.push(o);
            //         }

            //     }
            //     return a;
            // })();

            svg = d3
                .select(element)
                .append('svg')
				.attr('width', width + margin)
                .attr('height', height + margin)
				.append('g')
				.attr('transform', 'translate(' + (margin / 2) + ', ' + (margin / 2) + ')');

            getValues();
            renderChart();
            callback ? callback(true) : 0;
            // console.log(dataSet);

            function getValues() {
                let legendArr = [];

                dataSet.content= (function() {
                    let a = [];
    
                    for (let i = 0; i < json.data.length; i++) {
                        // let keys = Object.keys(json.data[i].values);
                        let keys = dataSet.columns;
    
                        for (let k of keys) {
                            let o = {};
    
                            o.label = dataSet.label[i];
                            o.index = i;
    
                            o.legend = k;
                            //This will add the missing objects into the values object with value null
                            if (json.data[i].values[k] && dataSet.columnsActive[k]) {
                                o.val = json.data[i].values[k]; //To keep null values as null
                            } else {
                                o.val = null;
                            }
                            a.push(o);
                        }
    
                    }
                    return a;
                })();

                json.data.map(d => {
                    let yTotal = 0;
                    for (let k in d.values){
                        yTotal += dataSet.columnsActive[k] ? d.values[k] : 0;
                    }
                    d.yTotal = Math.ceil(yTotal);
                });

                yMaxValue = d3.max(json.data, function(d) {
                    return d.yTotal;
                });

                let sumstat = d3
					.nest()
					.key(function(d) {
                        // console.log(d);
                        // return d.index;
						return d.label;
                    }).entries(dataSet.content);

                for (let j = 0; j < dataSet.columns.length; j++) {
                    legendArr.push(j);
                };
                // console.log(sumstat);
                // console.log(legendArr);
                // console.log(dataSet.columns);

                stack = d3
					.stack()
					.keys(legendArr)
					.value((d, key) => {
						return d.values[key].val;
                    })(sumstat);

                //adding index to each stack path
                for(let i = 0; i < stack.length; i++){
                    for (let j = 0; j < stack[i].length; j++){
                        // console.log(stack[i][j].data);
                        stack[i][j].data.index = j;
                    }
                }

            }
            // console.log(dataSet);
            // console.log('stack',stack);

            function renderChart(){
                let xScale;
				let yScale;

				// let palette = [
				// 	'#325610',
				// 	'#509b12',
				// 	'#8fbf67',
				// 	'#c6e5ac',
				// 	'#123c72',
				// 	'#4976af',
				// 	'#b0cdf2',
				// 	'#702325',
				// 	'#bf696b',
				// 	'#e5b5b6',
				// 	'#d66b08',
				// 	'#ff0',
				// 	'#ac0',
				// 	'#bb0',
				// 	'#ee3',
				// 	'#ba9',
				// 	'#f21',
				// 	'#b00',
				// 	'#c40'
                // ];

				let colorPalette = d3
					.scaleOrdinal()
					.range((function(){
						if(metaData.muteColors){
							let a = [];

							let dbBlues = [
								'#0018a8',
								'#0c2340',
								'#00a3e0',
								'#4ac9e3'
							];

							let dbNeutrals = [
								'#425563',
								'#768692',
								'#a4bcc2',
								'#b7b09c'
							];

							for(let i = 0, j = 0; i < dataSet.content.length; i++){
								a.push(dbNeutrals[j]);
								j = j === dbNeutrals.length - 1 ? 0 : j + 1;
							}

							return a;
						}else{
							return [
								'#8475e0', //added this color
								'#a145b3', //instead of #671e75
								'#da1884',
								'#e4002b',
								'#f4364c',
								'#e57200',
								'#00c7b1',
								'#00a82d',
								'#6ed619',
								'#cedc00',
								'#fce300',
								'#ffc845',
								'#b7b09c',
								'#a4bcc2',
								'#768692',
							];
						}
					})());

                let area = d3
					.area()
					// .curve(d3.curveCardinal)
					.x(d => {
                        // console.log(d);
                        // return xScale(d.data.key);
                        return xScale(d.data.index);
					})
					.y0(d => {
						return yScale(d[0]);
					})
					.y1(d => {
						return yScale(d[1]);
                    });

                function setScales() {
                    // set x scale
                    xScale = d3.scaleLinear().rangeRound([0, width-30]);

                    // set y scale
                    yScale = d3.scaleLinear().rangeRound([height - (legendHeight + xAxisHeight), 0]);
                }

                function setDomains() {
					xScale.domain(
                        d3.extent(dataSet.content.map(d => {
                            // console.log(d);
                            // return d.label;
                            return d.index;
                        }))
                    );

					yScale.domain([0, yMaxValue * 1.15]);
                }
                function renderYAxis(remove) {
					let yAxisEl;

					svg.append('g')
						.attr('class', 'axis yaxis')
						.call(d3.axisLeft(yScale));

					yAxisEl = svg.select('g.yaxis');
					yAxisWidth = Math.ceil(yAxisEl.node().getBoundingClientRect().width);

					if (yAxisWidth < 30) {
						yAxisWidth = 30; //make sure there is enough space (25px) for 2 digits plus a decimal (example: 3.2)
					}

					svg.select('g.yaxis').attr(`transform`, `translate(${yAxisWidth}, 0)`);

					if (remove) {
						yAxisEl.remove();
					}
                }

                function renderXAxis(remove){

					svg.append('g')
						.attr('class', 'axis xaxis')
						.call(d3.axisBottom(xScale))
						.selectAll('text')
						.style('text-anchor', 'end')
						.attr('dx', '-10')
						.attr('dy', '-6')
						.attr('transform', function(d) {
							return 'rotate(-90)';
                        });


                    svg.selectAll('g.tick text').each(function(d, i,el) {
                        d3.select(el[i]).text(dataSet.label[i]);
                    });

                    let xAxisEl = svg.select('g.xaxis');
					xAxisHeight = Math.ceil(xAxisEl.node().getBoundingClientRect().height) + 10; //10 padding between the xaxis and the legend
                    xAxisEl.attr('transform', `translate(${yAxisWidth}, ${height - (legendHeight + xAxisHeight)})`);

                    let xTick = svg.selectAll('g.tick');

					if (remove) {
                        xAxisEl.remove();
                        xTick.remove();
					}
                }

                function renderLegend(remove){
                    let legend = svg
						.append('g')
						.attr('class', 'legend')
						.attr('width', width);

					let legendGroups = legend
						.selectAll('rect')
						.data(dataSet.columns)
						.enter()
						.append('g')
						.attr('class', 'item');

					legendGroups
						.append('rect')
						.attr('x', 0)
						.attr('y', 0)
						.attr('width', 20)
						.attr('height', 20)
						.attr('fill', function(d, i) {
							return colorPalette(i);
						});

					legendGroups
						.append('text')
						.text(function(d) {
							return d;
						})
						.attr('x', 25) //20px for the block and + 5px for the spacing
						.attr('y', 5)
						.attr('text-anchor', 'start')
						.attr('alignment-baseline', 'hanging');

					legendGroups
						.append('rect')
						.attr('class', 'background')
						.attr('y', 0)
						.attr('height', 20)
                        .attr('width', function(d, i,el) {
							return el[i].parentNode.getBoundingClientRect().width + 5;
						});

					let legendPosX = 0;
                    let legendPosY = 0;

                    legendGroups.each(function(d,i,el) {
						let legendItemWidth = 0;

                        d3.select(el[i]).attr('transform', function(d, i,el) {
							legendItemWidth = Math.round(el[i].getBoundingClientRect().width) + 5;

							if (legendPosX + legendItemWidth > width - (yAxisWidth + 10)) {
								legendPosX = 0;
								legendPosY += 25;
							}

							return `translate(${legendPosX}, ${legendPosY})`;
						});

						legendPosX += legendItemWidth;
					});

					legendHeight = Math.ceil(legend.node().getBoundingClientRect().height + bottomSpacing);
					legend.attr('transform', `translate(0, ${height - legendHeight})`); //10 px of spacing

                    legendGroups.on('click', function(d, i,el) {
						dataSet.columnsActive[d] = !dataSet.columnsActive[d];
						el[i].setAttribute('inactive', !dataSet.columnsActive[d]);
						updateValues();
					});

					if (remove) {
						legend.remove();
					}
                }

                function renderGrid(){
					let makeXLines = () => d3.axisLeft().scale(yScale);

					svg.append('g')
						.attr('class', 'grid')
						.attr('transform', `translate(${yAxisWidth}, ${0})`)
						.call(
							makeXLines()
                                .tickSize(-stackWidth, 0, 0)
                                // .tickSize(-width, 0, 0)
								.tickFormat('')
						);
                }

                function renderStack(remove){
                    svg.append('g')
                        .attr('class', 'pathstack')
                        .attr('transform', `translate(${yAxisWidth}, ${0})`)
                        .selectAll('path')
                        .data(stack)
                        .enter()
                        .append('path')
                        .attr('class', 'segments')
                        .attr('fill', function(d, i) {
                            return colorPalette(i);
                        })
                        .attr('label', function(d) {
                            return d.key;
                        })
                        .attr('d', area)
                        .on('mouseover', function(d, i){
							let o = {values: d, index: i, label: dataSet.columns[i]};
							tooltip.update({data: o, meta: metaData});
	                	})
						.on('mouseout', function(d, i){
							tooltip.hide();
						});

                    let stackEl = svg.select('g.pathstack');

                    stackWidth = Math.ceil(stackEl.node().getBoundingClientRect().width);

                    if (remove){
                        stackEl.remove();
                    }
                }

                function updateValues() {
					getValues();
					setDomains();

					//update yaxis
					svg.select('.yaxis')
						.transition(125)
						.call(d3.axisLeft(yScale));

					//update grid lines
					svg.select('.grid')
						.transition(125)
						.call(
							d3
								.axisLeft()
								.scale(yScale)
                                .tickSize(-stackWidth, 0, 0)
                                // .tickSize(-width, 0, 0)
								.tickFormat('')
						);

					//update stack
					svg.selectAll('g.pathstack path.segments')
						.data(stack)
						.transition(125)
						.attr('d', area);
				}

                setScales();
                setDomains();
                renderStack(true);

				renderLegend();
				renderYAxis(true);
				renderXAxis(true);

				setScales();
				setDomains();

				renderXAxis();
				renderYAxis();
                renderGrid();
				renderStack();
            }
        },
        fini: function(){
            // console.log('this is your destroy function');
        },
		update: function(){
			o.el.innerHTML = '';

			window.requestAnimationFrame(function(){
				o.init(o.el, o.params.width, o.params.height, o.params.json, function(response){
					// console.log('re-rendered chart:', o);
				});
			});
		}
    }

    o.params = params;
	return o;
}
