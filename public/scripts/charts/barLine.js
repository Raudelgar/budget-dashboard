function BarLineChart(params){
	let o = {
		init: function(element, width, height, json, callback){
			let margin = 40; //svg margin
			let bottomSpacing = 0;
			let legendHeight = 0;
			let xAxisHeight = 0;
			let yAxisWidthLeft = 0;
			let yAxisWidthRight = 0;
			let yMaxValueLeft = 0;
            let yMaxValueRight = 0;
            let yLeftTransformArr = [];
            let yRightTransformArr = [];
            let left = false;
            let right = false;
            let yAxisElLeft;
            let yAxisElRight;
            let metaData;
            let dataSet;
            let svg;

			element = typeof element === 'string' ? document.body.querySelector(element) : element;
			width = Math.floor(element.getBoundingClientRect().width) - margin; //20px of margin on each side
            height = Math.floor(element.getBoundingClientRect().height) - margin; //20px of margin on each side
			o.el = element;

			if(width < 0 && height < 0){
                return;
            }

            metaData = json.format;
			dataSet = {
                content: (function() {
                    let a = [];

                    for (let d of json.data) {
                        for (let i = 0; i < d.dataBar.length; i++) {
                            let o = {dataBar: [], dataLine: []};
                            let barObj = {};
                            let lineObj = {};

                            //this will convert the date format on the labels from the database
                            let time = new Date(d.dataBar[i].label).getTime();
                            let date = formatter.formatDate(time, 'MMM-YYYY').toUpperCase();
                            o.label = date;
                            barObj.label = date;
                            lineObj.label = date;
                            let keyBar = Object.keys(d.dataBar[i].values)[0];
                            let keyLine = Object.keys(d.dataLine[i].values)[0];

                            barObj.key = keyBar;
                            //this is temporary converting the numbers from billions
                            let value = Number(d.dataBar[i].values[keyBar]);
                            barObj.value = Number(formatter.convertToBillion(value).toFixed(1));
                            o.dataBar.push(barObj);

                            lineObj.key = keyLine;
                            lineObj.value = Number(d.dataLine[i].values[keyLine]);
                            o.dataLine.push(lineObj);

                            a.push(o);
                        }
                    }
                    return a;
                })()
            }

            //dataBar
            dataSet.dataBar = (function() {
                let a = [];
                for (let d of dataSet.content) {
                    for (let b of d.dataBar) {
                        let o = {};
                        o.label = b.label;
                        o.values = {};
                        o.values[b.key] = b.value;

                        a.push(o);
                    }
                }
                return a;
            })();

            //dataLine
            dataSet.dataLine = (function() {
                let a = [];
                for (let d of dataSet.content) {
                    for (let l of d.dataLine) {
                        let o = {};
                        o.label = l.label;
                        o.values = {};
                        o.values[l.key] = l.value;

                        a.push(o);
                    }
                }
                return a;
            })();

            //Creating columns
            dataSet.columns = (function(){
                let a = [];
                let b = [];
                let l = [];

                //This loop will construct the columns array
                for (let i = 0; i < dataSet.dataBar.length; i++){
                    let tmp = Object.keys(dataSet.dataBar[i].values);
                    b = tmp.length > b.length ? tmp : b;
                }
                for (let i = 0; i < dataSet.dataLine.length; i++){
                    let tmp = Object.keys(dataSet.dataLine[i].values);
                    l = tmp.length > l.length ? tmp : l;
                }

                for (let v of b) {
                    a.push(v);
                }

                for (let v of l) {
                    a.push(v);
                }

                return a;
            })();

            //Storing legend column active
            dataSet.columnsActive = (function() {
                let o = {};
                dataSet.columns.map(c => {
                    o[c] = true;
                });
                return o;
            })();

            //key Category for dataBar
            dataSet.keyBar = (function() {
                let a = [];

                for (let d of dataSet.dataBar){
                    let tmp = Object.keys(d.values);
                    a = tmp.length > a.length ? tmp : a;
                }

                return a;
            })();

             //key category for dataLine
             dataSet.keyLine = (function() {
                let a = [];

                for (let d of dataSet.dataLine){
                    let tmp = Object.keys(d.values);
                    a = tmp.length > a.length ? tmp : a;
                }

                return a;
            })();

            //this will a data label formatting for pre and post values
			//TODO - don't hardcode!
            let dataFormat = {
                dataBar: {
                    pre: '€',
                    post:'bn'
                },
                dataLine: {
                    pre: null,
                    post:'Bps'
                }
            }

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

			function getValues(){
				let keyBar = dataSet.keyBar[0],
					keyLine = dataSet.keyLine[0];

                dataSet.dataBar.map(d => {
					yMaxValueLeft = d.values[keyBar] > yMaxValueLeft ? d.values[keyBar] : yMaxValueLeft;
				});
				dataSet.dataLine.map(d => {
					yMaxValueRight = d.values[keyLine] > yMaxValueRight ? d.values[keyLine] : yMaxValueRight;
				});
			}

			function renderChart(){
				let	xScaleBar,
					xScaleLine,
					yScaleBar,
					yScaleLine,
                    keyLine = dataSet.keyLine[0],
                    keyBar = dataSet.keyBar[0],
                    columns = dataSet.columns,
                    colorLine = columns.indexOf(keyLine),
                    colorBar = columns.indexOf(keyBar),
                    dataBar = dataSet.dataBar,
                    dataLine = dataSet.dataLine;

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
									'#768692',
									'#425563',
									'#b7b09c',
									'#a4bcc2'
								];

								for(let i = 0, j = 0; i < dataSet.content.length; i++){
									a.push(dbNeutrals[j]);
									j = j === dbNeutrals.length - 1 ? 0 : j + 1;
								}

								return a;
							}else{
								return [
									'#8475e0', //added this color
									'#da1884',

									// '#8475e0', //added this color
									// '#a145b3', //instead of #671e75
									// '#da1884',
									// '#e4002b',
									// '#f4364c',
									// '#e57200',
									// '#00c7b1',
									// '#00a82d',
									// '#6ed619',
									// '#cedc00',
									// '#fce300',
									// '#ffc845',
									// '#b7b09c',
									// '#a4bcc2',
									// '#768692',
								];
							}
						})());

				//Enter => dataSet.dataLine as => d
				let valueLine = d3
					.line()
					.x(d => {
						return xScaleLine(d.label);
					})
					.y(d => {
						return yScaleLine(d.values[keyLine]);
					});

				function setScales(){
					// set x scale
					xScaleBar = d3
						.scaleBand()
						.rangeRound([0, width - yAxisWidthLeft - yAxisWidthRight])
						.paddingInner(0.1);

					xScaleLine = d3.scaleBand().rangeRound([0, width - yAxisWidthLeft - yAxisWidthRight]);

					// set y scale
					yScaleBar = d3.scaleLinear().rangeRound([height - (legendHeight + xAxisHeight), 0]);

					yScaleLine = d3.scaleLinear().rangeRound([height - (legendHeight + xAxisHeight), 0]);
				}

				function setDomains(){
					xScaleBar.domain(
						dataBar.map(d => {
							return d.label;
						})
					);

					xScaleLine.domain(
						dataLine.map(d => {
							return d.label;
						})
					);

					yScaleBar.domain([0, yMaxValueLeft*1.1]);
                    yScaleLine.domain([0, yMaxValueRight * 1.1]);

                    let yLeftDomain = yScaleBar.ticks();
                    let yRightDomain = yScaleLine.ticks();

                    if (yLeftDomain.length > yRightDomain.length) {
                        let count = yLeftDomain.length - yRightDomain.length;
                        let diff = yRightDomain[yRightDomain.length - 1] - yRightDomain[yRightDomain.length - 2];

                        let last = yRightDomain[yRightDomain.length - 1]
                        for (let i = 0; i < count - 1; i++) {
                            last += diff;
                        }
                        yMaxValueRight = last;
                    } else if (yLeftDomain.length < yRightDomain.length) {
                        let count = yRightDomain.length - yLeftDomain.length;
                        let diff = yLeftDomain[yLeftDomain.length - 1] - yLeftDomain[yLeftDomain.length - 2];

                        let last = yLeftDomain[yLeftDomain.length - 1]
                        for (let i = 0; i < count - 1; i++) {
                            last += diff;
                        }
                        yMaxValueLeft = last;
                    }
				}

                function renderYAxis(remove) {
					svg.append('g')
						.attr('class', 'axis yaxisLeft')
                        .call(d3.axisLeft(yScaleBar))
                        .selectAll('text')
                        .style('fill', colorPalette(0));

					svg.append('g')
						.attr('class', 'axis yaxisRight')
						.call(d3.axisRight(yScaleLine))
                        .selectAll('text')
                        .style('fill', colorPalette(1))
						.attr('x', '20');

                    yAxisElLeft = svg.select('g.yaxisLeft');
					yAxisWidthLeft = Math.ceil(yAxisElLeft.node().getBoundingClientRect().width);

                    svg.select('g.yaxisLeft').attr(`transform`, `translate(${yAxisWidthLeft}, 0)`);

                    yAxisElRight = svg.select('g.yaxisRight');
					yAxisWidthRight = Math.ceil(yAxisElRight.node().getBoundingClientRect().width);

                    svg.select('g.yaxisRight').attr(`transform`, `translate(${width - yAxisWidthRight}, 0)`);

                    //Who Axis has the bigger length, will be choose has the reference
                    if (left) {
                        yAxisElLeft.selectAll('g.tick').each(function(d, i, parent) {
                            yLeftTransformArr.push(parent[i].getAttribute('transform'));
                        });
    
                        yAxisElRight.selectAll('g.tick').each(function(d, i, parent) {
                            return parent[i].setAttribute('transform', yLeftTransformArr[i]);
                        });
                    } else if (right) {
                        yAxisElRight.selectAll('g.tick').each(function(d, i, parent) {
                            yRightTransformArr.push(parent[i].getAttribute('transform'));
                        });

                        yAxisElLeft.selectAll('g.tick').each(function(d, i, parent) {
                            return parent[i].setAttribute('transform', yRightTransformArr[i]);
                        });
                    } else {
                        yAxisElLeft.selectAll('g.tick').each(function(d, i, parent) {
                            yLeftTransformArr.push(parent[i].getAttribute('transform'));
                        });
    
                        yAxisElRight.selectAll('g.tick').each(function(d, i, parent) {
                            yRightTransformArr.push(parent[i].getAttribute('transform'));
                        });
                    }

                    if (yLeftTransformArr.length >= yRightTransformArr.length) {
                        left = true;
                    } else {
                        right = true;
                    }

					if (remove) {
						yAxisElLeft.remove();
                        yAxisElRight.remove();
                        yLeftTransformArr = [];
                        yRightTransformArr = [];
                    }
				}

				function renderLegend(remove){
					let legend = svg
						.append('g')
						.attr('class', 'legend')
						.attr('width', width);

					let legendGroups = legend
						.selectAll('rect')
						.data(columns)
						.enter()
						.append('g')
						.attr('class', 'item');

                    legendGroups
						.append('rect')
                        .attr('x', 0)
						.attr('y', function(d){
                            let y = d === keyBar ? 0 : 7;
                            return y;
                        })
						.attr('width', 20)
                        .attr('height', function(d) {
                            let h = d === keyBar ? 20 : 7;
                            return h;
                        })
						.attr('fill', function(d, i){
							return colorPalette(i);
                        });

					legendGroups
						.append('text')
						.text(function(d){
							d = d === keyBar ? d + '(bn)' : d + '(Bps)';
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
						.attr('width', function(d, i,el){
							return el[i].parentNode.getBoundingClientRect().width + 5;
						});

					let legendPosX = 0;
					let legendPosY = 0;

					legendGroups.each(function(d,i,el){
						let legendItemWidth = 0;

						d3.select(el[i]).attr('transform', function(d, i,el){
							legendItemWidth = el[i].getBoundingClientRect().width + 5;

							if (legendPosX + legendItemWidth > width - (yAxisWidthLeft + yAxisWidthRight + 10)){
								legendPosX = 0;
								legendPosY += 25;
							}

							return `translate(${legendPosX}, ${legendPosY})`;
						});

						legendPosX += legendItemWidth;
					});

					legendHeight = Math.ceil(legend.node().getBoundingClientRect().height + bottomSpacing);
					legend.attr('transform', `translate(0, ${height - legendHeight})`); //10 px of spacing

					legendGroups.on('click', function(d, i,el){
						dataSet.columnsActive[d] = !dataSet.columnsActive[d];
						el[i].setAttribute('inactive', !dataSet.columnsActive[d]);
                        updateValues(d,dataSet.columnsActive[d]);
					});

					if (remove) {
						legend.remove();
					}
				}

				function renderXAxis(remove){
					svg.append('g')
						.attr('class', 'axis xaxis')
						.call(d3.axisBottom(xScaleBar))
						.selectAll('text')
						.style('text-anchor', 'end')
						.attr('dx', '-10')
						.attr('dy', '-6')
						.attr('transform', function(d){
							return 'rotate(-90)';
						});

					let xAxisEl = svg.select('g.xaxis');

					xAxisHeight = Math.ceil(xAxisEl.node().getBoundingClientRect().height) + 10; //10 padding between the xaxis and the legend
					xAxisEl.attr('transform', `translate(${yAxisWidthLeft}, ${height - (legendHeight + xAxisHeight)})`);

					if (remove) {
						xAxisEl.remove();
					}
				}

				function renderGrid(){
					let makeXLines = () => d3.axisLeft().scale(yScaleBar);

					svg.append('g')
						.attr('class', 'grid')
						.attr('transform', `translate(${yAxisWidthLeft}, ${0})`)
						.call(
							makeXLines()
								.tickSize(yAxisWidthLeft + yAxisWidthRight - width, 0, 0)
								.tickFormat('')
						);
				}


				function renderStack(){
					let	h = height - (legendHeight + xAxisHeight);

					let stack = svg
						.append('g')
						.attr('class', 'stack')
						.attr('transform', `translate(${yAxisWidthLeft}, ${0})`);

					//Add Bar Rect
					let stackBar = stack
						.selectAll('g')
						.data(dataSet.content)
						.enter()
						.append('g')
						.attr('class', 'bar')
						.on('mouseover', function(d, i){
							tooltip.update({data: d, meta: metaData});
						})
						.on('mouseout', function(d, i){
							tooltip.hide();
						})
						.selectAll('rect')
						.data(d => {
							return d.dataBar;
						})
						.enter()
						.append('rect')
						.attr('width', xScaleBar.bandwidth())
						.attr('height', d => {
							return h - yScaleBar(d.value);
						})
						.attr('x', function(d, i){
							return xScaleBar(d.label);
						})
						.attr('y', function(d, i){
							return yScaleBar(d.value);
						})
                        .attr('fill', colorPalette(0));

					//Add Line Path
					let stackLine = stack
						.selectAll('path')
						.data([dataSet.dataLine])
						.enter()
						.append('path')
						.attr('class', 'line')
						.attr('transform', `translate(${xScaleLine.bandwidth() / 2}, ${0})`)
						.attr('d', valueLine)
						.on('mouseover', function(d, i){
							// tooltip.update({data: d, meta: metaData});
						})
						.on('mouseout', function(d, i){
							// tooltip.hide();
						})
						.style('stroke', colorPalette(1));
				}

				function updateValues(column,value){
					getValues();
                    setDomains();

                    //update yaxis
                    let yAxisElLeft = svg.select('g.yaxisLeft');
                    let yAxisElRight = svg.select('g.yaxisRight');

                    if (column === keyBar && !value) {
						yAxisElLeft.attr('disabled', true);
                    }else if (column === keyLine && !value) {
						yAxisElRight.attr('disabled', true);
                    }else{
						yAxisElLeft.attr('disabled', null);
						yAxisElRight.attr('disabled', null);
					}

					//update grid lines
					svg.select('.grid')
						.transition(125)
						.call(
							d3
								.axisLeft()
								.scale(yScaleBar)
								.tickSize(yAxisWidthLeft + yAxisWidthRight - width, 0, 0)
								.tickFormat('')
						);

					//update stack
					if (column === keyBar){
						svg.selectAll('g.stack g.bar')
							.data(dataSet.content)
							.selectAll('rect')
							.transition(125)
							.attr('width', function(d, i){
								if (dataSet.columnsActive[d.key]) {
									return xScaleBar.bandwidth();
								} else {
									return 0;
								}
							})
							.attr('height', function(d, i){
								if (dataSet.columnsActive[d.key]) {
									let h = height - (legendHeight + xAxisHeight);
									return h - yScaleBar(d.value);
								} else {
									return 0;
								}
							})
							.attr('x', function(d, i,el){
								if (dataSet.columnsActive[d.key]){
									return xScaleBar(d.label);
								} else {
									return Number(el[i].getAttribute('x')) + (xScaleBar.bandwidth() / 2);
								}
							})
							.attr('y', function(d, i) {
								if (dataSet.columnsActive[d.key]){
									return yScaleBar(d.value);
								} else {
									return height - (legendHeight + xAxisHeight);
								}
							});
					}else if (column === keyLine){
						let line = svg.select('g.stack path.line');
							line.attr('disabled', line.attr('disabled') ? null : true);
					}
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
