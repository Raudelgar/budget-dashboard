function StackedNegativeBarChart(params){
	let o ={
		init: function(element, width, height, json, callback){
            let margin = 40; //svg margin
            let legendHeight = 0;
			let characterWidth = 7.5; //7.5px per char width
			let wordLengthSpacing = 0;
			let bottomSpacing = 35;
            let right = 10;
            let yAxisWidth = 0;
            let xAxisHeight = 0;
            let xMaxValue;
			let xMinValue;
			let stack;
            let metaData;
            let dataSet;
            let svg;

            element = typeof element === 'string' ? document.body.querySelector(element) : element;
            width = Math.ceil(element.getBoundingClientRect().width) - margin;
            height = Math.ceil(element.getBoundingClientRect().height) - margin;
            o.el = element;

            if (width < 0 && height < 0) {
                return;
            }

            metaData = json.format;
            dataSet = {
                content: json.data,
                columns: (function(){
                    let a = [];

                    //This loop will construct the columns array
                    for (let i = 0; i < json.data.length; i++){
                        let tmp = Object.keys(json.data[i].values);
                        a = tmp.length > a.length ? tmp : a;
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

			bottomSpacing += (dataSet.columns.length * (20 + 5));

			for(let i = 0, size = 0; i < dataSet.content.length; i++){
				size = dataSet.content[i].label.length * characterWidth;
				wordLengthSpacing = size > wordLengthSpacing ? size : wordLengthSpacing;
			}

			//give it a max of 250px of word spacing before starting the graph unless the longest word is not that long
			wordLengthSpacing = Math.ceil(Math.min(250, wordLengthSpacing + 10)); //10px of spacing

            svg = d3.select(element)
                .append('svg')
                .attr('width', width + margin)
                .attr('height', height + margin)
                .append('g')
                .attr('transform', 'translate(' + (margin / 2) + ', ' + (margin / 2) + ')')
                .classed('container', true);

            getValues();
			renderChart();
			callback ? callback(true) : 0;

            function getValues() {
                // let data = dataSet.content;
				dataSet.content.map((d, i) => {
					let max = 0,
						min = 0;

					dataSet.columns.map(l => {
						if(dataSet.columnsActive[l]){
							dataSet.content[i][l] = d.values[l];

							if(d.values[l]){
								if(d.values[l] > 0){
									max += d.values[l];
								}else{
									min += d.values[l];
								}
							}
                        } else {
                            dataSet.content[i][l] = null;
						}
					});

					dataSet.content[i].maxValue = max;
					dataSet.content[i].minValue = min;
				});

				xMaxValue = d3.max(dataSet.content, function(d){
					return d.maxValue;
				});

				xMinValue = d3.min(dataSet.content, function(d){
					return d.minValue;
				});

                stack = d3
					.stack()
					.keys(dataSet.columns)
                    .offset(d3.stackOffsetDiverging)(dataSet.content);
            }

            function renderChart() {
                let xScale;
                let yScale;

                let palette = [
                    '#da1884',
                    '#a145b3', //instead of #671e75
                    '#00c7b1',
                    '#e4002b',
                    '#f4364c',
                    '#e57200',
                    '#00a82d',
                    '#cedc00',
                    '#fce300',
                    '#ffc845'
                ];

                let colors = d3.scaleOrdinal().range(palette).domain(dataSet.columns);

                function setScales(){
                    yScale = d3
				        .scaleBand()
				        .rangeRound([0, height - bottomSpacing])
				        .paddingInner(0.05)
                        .align(0.5);

                    xScale = d3
                        .scaleLinear()
                        .rangeRound([0, width - wordLengthSpacing - right]);
                }

                function setDomains(){
                    let data = dataSet.content;
                    let yDomain = data.map(d => d.label);

                    xScale.domain([xMinValue * 1.05, xMaxValue * 1.05]).nice();

                    yScale.domain(
                        yDomain.map(d => {
                            return d;
                        })
                    );
                }

                //grid
                function renderGrid() {
                    let makeYLines = () => d3.axisLeft().scale(yScale);
				    let makeXLines = () => d3.axisBottom().scale(xScale);

				    svg.append('g')
					    .attr('class', 'grid')
					    .attr('transform', `translate(${wordLengthSpacing}, 0)`)
					    .call(
						    makeXLines()
							    .tickSize(height - bottomSpacing)
							    .ticks(Math.ceil((width - wordLengthSpacing) / 50))
							    .tickFormat('')
					    );
                }

                //yAxis
                function renderYAxis(remove) {
                    let yAxis = d3.axisRight(yScale);
				    svg.append('g')
					    .attr('class', 'yaxis')
					    .call(yAxis);

				    svg.selectAll('g.yaxis g.tick text')
                        .each(function(d, i, el) {
						    d3.select(el[i])
							    .attr('fill', null)
							    .attr('dy', null)
							    .attr('x', 1)
							    .attr('gid', i);
                        });

                    let yAxisEl = svg.selectAll('g.yaxis');
				    yAxisWidth = Math.ceil(yAxisEl.node().getBoundingClientRect().width);

				    if(yAxisWidth < 25){
					    yAxisWidth = 25; //make sure there is enough space (25px) for 2 digits plus a decimal (example: 3.2)
				    }
                    // console.log('y width',yAxisWidth);//95

                    if(remove){
						yAxisEl.remove();
					}

                }


                //xAxis
                function renderXAxis(remove) {
                    let xAxis = d3.axisBottom(xScale);

				    svg.append('g')
					    .attr('class', 'xaxis')
					    .attr('transform', `translate(${wordLengthSpacing}, ${height - bottomSpacing})`)
					    .call(xAxis.ticks(Math.ceil((width - wordLengthSpacing) / 50)).tickFormat(d3.format('0.1f')));

                    let xAxisEl = svg.select('g.xaxis');

                    // xAxisHeight = Math.ceil(xAxisEl.node().getBoundingClientRect().height) + 10; //10 padding between the xaxis and the legend
                    // xAxisEl.attr('transform', `translate(${yAxisWidth}, ${height - (legendHeight + xAxisHeight)})`);

                    if(remove){
                        xAxisEl.remove();
                    }
                }


                //legend
                function renderLegend(remove) {
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
                        .attr('fill', function(d, i){
                            return palette[i];
                            // return colors(d);
                        });

                    legendGroups
                        .append('text')
                        .text(function(d){
                            return d;
                        })
                        .attr('x', 25) //20px for the block and + 5px for the spacing
                        .attr('y', 12)//5
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

                        d3
                            .select(el[i])
                            .attr('transform', function(d, i,el) {
                                legendItemWidth = el[i].getBoundingClientRect().width + 5;

                                if(legendPosX + legendItemWidth > width - (yAxisWidth + 10)){
                                    //10 px of spacing
                                    legendPosX = 0;
                                    legendPosY += 25;
                                }

                                return `translate(${legendPosX}, ${legendPosY})`;
                            });

                        legendPosX += legendItemWidth;
                    });

                    legendHeight = Math.ceil(legend.node().getBoundingClientRect().height + bottomSpacing);
                    legend.attr('transform', `translate(0, ${height - legendHeight+65})`); //10 px of spacing

                    legendGroups.on('click', function(d, i,el) {
                        dataSet.columnsActive[d] = !dataSet.columnsActive[d];
                        el[i].setAttribute('inactive', !dataSet.columnsActive[d]);
                        updateValues();
                    });
                }

                function renderStack() {
                    svg
					.append('g')
					.attr('class', 'selectionbars')
					.attr('transform', `translate(-5,0)`) //5 pixels to accomodate for the +5 padding of the width
					.selectAll('rect')
					.data(dataSet.content)
					.enter()
					.append('rect')
					.attr('class', 'selectbar')
					.attr('gid', function(d, i){return i;})
					.attr('x', 0)
					.attr('y', d => {
						return yScale(d.label);
					})
					.attr('height', yScale.bandwidth())
					.attr('width', width + 10) //5 pixels of padding for each side
                    .on('mouseover', function(d, i, el) {
                        let thisEl = d3.select(el[i]);
                        let gid = thisEl.attr('gid');
                        let els = svg.selectAll('[gid="' + gid + '"]');

                        els.each(function(d,i,elem) {
							d3.select(elem[i]).classed('active', true);
                        });

                        svg.classed('hover', true);

                        tooltip.update({data: d, meta: metaData});
                        tooltip.toggled(el[i]);
                	})
                    .on('mouseout', function(d, i, el) {
                        let thisEl = d3.select(el[i]);
                        let gid = thisEl.attr('gid');
                        let els = svg.selectAll('[gid="' + gid + '"]');

                        els.each(function(d,i,elem){
							d3.select(elem[i]).classed('active', false);
						});

                        svg.classed('hover', false);

                        tooltip.hide();
	                })
                    .on('click', function(d, i, el) {
						let thisEl = d3.select(el[i]);
						let gid = thisEl.attr('gid');
						let toggleCount = Number(svg.node().getAttribute('togglecount')) || 0;

						let els = svg.selectAll('[gid="' + gid + '"]');

                        if (!thisEl.classed('toggled')) {
							thisEl.classed('toggled', true);

							els.each(function(d,i,elem){
								d3.select(elem[i]).classed('toggled', true);
							});

							toggleCount++;
							svg.node().setAttribute('togglecount', toggleCount);
							svg.classed('toggled', true);
                        } else {
							thisEl.classed('toggled', false);

							els.each(function(d,i,elem){
								d3.select(elem[i]).classed('toggled', false);
							});

							toggleCount--;
							svg.node().setAttribute('togglecount', toggleCount);

							if(!toggleCount || toggleCount < 0){
								toggleCount = 0;
								svg.node().removeAttribute('togglecount');
								svg.classed('toggled', false);
							}
						}

                        tooltip.toggled(el[i]);
                    });

                    let bars = svg.append('g')
                        .attr('class', 'stack')
                        .attr('transform', `translate(${wordLengthSpacing},0)`)
                        .selectAll('g')
                        .data(stack)
                        .enter()
                        .append('g')
                        .attr('class', 'bars')
                        .attr('label', function(d) {
                            return d.key;
                        })
                        .attr('fill', function(d){
                            return colors(d.key);
                        })
                        .selectAll('rect')
                        .data(function(d, i){
                            for (let j = 0; j < d.length; j++){
                                d[j].column = dataSet.columns[i];
                                d[j].columnId = i;
                            }
                            return d;
                        }).enter();

                    bars.append('rect')
                        .attr('gid', function(d, i){return i;})
                        .attr('x', function(d, i){
                            // return dataSet.columnsActive[d.column] ? xScale(d[0]) : null;
                            return xScale(d[0]);
                        })
                        .attr('y', d => {
                            return yScale(d.data.label);
                        })
                        .attr('width', d => {
                            return xScale(d[1]) - xScale(d[0]);
                        })
                        .attr('height', yScale.bandwidth());

                }

                function updateValues(){
                    getValues();
                    setDomains();
                    // console.log(dataSet.content);
                    // console.log(stack);

					svg
						.selectAll('g.grid')
						.transition(125)
						.call(
                           d3.axisBottom().scale(xScale)
                               .tickSize(height - bottomSpacing)
                               .ticks(Math.ceil((width - wordLengthSpacing) / 50))
                               .tickFormat('')
						);

                    svg
                        .selectAll('g.xaxis')
						.transition(125)
						.attr('transform', `translate(${wordLengthSpacing},${height - bottomSpacing})`)
						.call(d3.axisBottom(xScale).ticks(Math.ceil((width - wordLengthSpacing) / 50)).tickFormat(d3.format('0.1f')));

                    svg
                        .selectAll('g.stack g.bars')
                        // .data(stack)
						.selectAll('rect')
						.transition(125)
                        .attr('x', function(d2, i2) {
                            return xScale(stack[d2.columnId][i2][0]);
						})
						.attr('width', function(d2, i2){
                            return xScale(stack[d2.columnId][i2][1]) - xScale(stack[d2.columnId][i2][0]);
						});
                }

                setScales();
                setDomains();

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
	};

	o.params = params;
	return o;
}
