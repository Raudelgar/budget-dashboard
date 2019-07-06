function StackedBarChart(params){
	let o = {
		init: function(element, width, height, json, callback){
			let margin = 40; //svg margin
			let bottomSpacing = 0;
			let legendHeight = 0;
			let xAxisHeight = 0;
			let yAxisWidth = 0;
			let yMaxValue;
			let stack;
			let metaData = json.format;
            let dataSet;
            let svg;

			element = typeof element === 'string' ? document.body.querySelector(element) : element;
			width = Math.ceil(element.getBoundingClientRect().width) - margin;
            height = Math.ceil(element.getBoundingClientRect().height) - margin;
			o.el = element;

			if(width < 0 && height < 0){
                return;
            }

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


            //This loop will add the missing objects into the values object with value zero
            for (let i = 0; i < json.data.length; i++){
                let tmp = Object.keys(json.data[i].values);
                if (dataSet.columns.length > tmp.length) {
                    dataSet.columns.map(c => {
                        if (!tmp.includes(c)) {
                            json.data[i].values[c] = null;
                        }
                    })
                }

                //this will convert the date format on the labels from the database
                let time = new Date(json.data[i].label).getTime();
                let date = formatter.formatDate(time, 'MMM-YYYY').toUpperCase();
                json.data[i].label = date;
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
				dataSet.content = (function(){
					let a = [];

					for(let i = 0; i < json.data.length; i++){
						let o = {
							label: json.data[i].label,
							values: {}
						};

                        for (let k in json.data[i].values) {
							if(dataSet.columnsActive[k]){
								o.values[k] = json.data[i].values[k];
							}else{
								o.values[k] = 0;
							}
						}

						a.push(o);
					}

					return a;
				})();

				yMaxValue = d3.max(dataSet.content, function(d){
					let yTotal = 0;

					for(let k in d.values){
						yTotal += (dataSet.columnsActive[k] ? d.values[k] : 0);
					}

					return yTotal;
				});

				stack = d3
					.stack()
					.keys(dataSet.columns)
					.value((d, key) => {return d.values[key];})(dataSet.content);
            }

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
				// 	'#d66b08'
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

				function setScales(){
					xScale = d3 // set x scale
						.scaleBand()
						.rangeRound([0, width - yAxisWidth])
						.paddingInner(0.01);
					// .align(0.1);

					yScale = d3 // set y scale
						.scaleLinear()
						.rangeRound([height - (legendHeight + xAxisHeight), 0]);
				}

				function setDomains(){
					xScale.domain(dataSet.content.map(d => {return d.label;}));
					yScale.domain([0, yMaxValue]);
				}

				function renderYAxis(remove){
					let yAxisEl;

					svg
						.append('g')
						.attr('class', 'axis yaxis')
						.call(d3.axisLeft(yScale));

					yAxisEl = svg.select('g.yaxis');
                    yAxisWidth = Math.ceil(yAxisEl.node().getBoundingClientRect().width);

					if(yAxisWidth < 30){
						yAxisWidth = 30; //make sure there is enough space (30px) for 2 digits plus a decimal (example: 3.2)
					}

					svg
						.select('g.yaxis')
						.attr(`transform`, `translate(${yAxisWidth}, 0)`);

					if(remove){
						yAxisEl.remove();
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
							return colorPalette(d);
						});

					legendGroups
						.append('text')
						.text(function(d){
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
                        .attr('width', function(d, i, el) {
							return el[i].parentNode.getBoundingClientRect().width + 5
						});

					let legendPosX = 0;
					let legendPosY = 0;

					legendGroups.each(function(d,i,el){
						let legendItemWidth = 0;

						d3
							.select(el[i])
							.attr('transform', function(d, i,el){
								legendItemWidth = Math.round(el[i].getBoundingClientRect().width) + 5;

								if(legendPosX + legendItemWidth > width - (yAxisWidth + 10)){ //10 px of spacing
									legendPosX = 0;
									legendPosY += 25;
								}

								return `translate(${legendPosX}, ${legendPosY})`;
							});

						legendPosX += legendItemWidth;
					});

					legendHeight = Math.ceil(legend.node().getBoundingClientRect().height + bottomSpacing + 10); //10 px for spacing
					legend.attr('transform', `translate(0, ${height - legendHeight + 10})`); //10 px for spacing

					legendGroups.on('click', function(d, i,el){
						dataSet.columnsActive[d] = !dataSet.columnsActive[d];
                        el[i].setAttribute('inactive', !dataSet.columnsActive[d]);
						updateValues();
					});

					if(remove){
						legend.remove();
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
						.attr('transform', function(d){
							return 'rotate(-90)';
						});

					let xAxisEl = svg.select('g.xaxis');

					xAxisHeight = Math.ceil(xAxisEl.node().getBoundingClientRect().height) + 10; //10 padding between the xaxis and the legend
					xAxisEl.attr('transform', `translate(${yAxisWidth}, ${height - (legendHeight + xAxisHeight)})`);

					if(remove){
						xAxisEl.remove();
					}
				}

				function renderGrid(){
					svg
						.append('g')
						.attr('class', 'grid')
						.attr('transform', `translate(${yAxisWidth}, ${0})`)
						.call(
							d3.axisLeft().scale(yScale)
								.tickSize(yAxisWidth - width, 0, 0)
								.tickFormat('')
						);
				}

				function renderStack(){
					svg
						.append('g')
						.attr('class', 'stack')
						.attr('transform', `translate(${yAxisWidth}, ${0})`)
						.selectAll('g')
						.data(stack)
						.enter()
						.append('g')
						.attr('class', 'segments')
						.attr('label', function(d){return d.key;})
                        .attr('fill', function(d) {
                            return colorPalette(d.key);
                        })
						.selectAll('rect')
						.data(function(d){
							return d;
						})
						.enter()
						.append('rect')
						.attr('x', function(d){
							return xScale(d.data.label);
						})
						.attr('y', function(d){
							return yScale(d[1]);
						})
						.attr('height', function(d){
							return yScale(d[0]) - yScale(d[1]);
						})
						.attr('width', xScale.bandwidth() - 1)
						.on('mouseover', function(d, i){
							tooltip.update({data: d.data, meta: metaData});
	                	})
						.on('mouseout', function(d, i){
							tooltip.hide();
						});
				}

				function updateValues(){
					getValues();
                    setDomains();

					//update yaxis
					svg
						.select('.yaxis')
						.transition(125)
						.call(d3.axisLeft(yScale));

					//update grid lines
					svg
						.select('.grid')
						.transition(125)
						.call(
							d3.axisLeft().scale(yScale)
								.tickSize(yAxisWidth - width, 0, 0)
								.tickFormat('')
						);

					//update stack
					svg
                        .selectAll('g.stack g.segments')
						.data(stack)
						.selectAll('rect')
						.data(function(d){return d;})
						.transition(125)
						.attr('y', function(d){
							return yScale(d[1]);
						})
						.attr('height', function(d){
							return yScale(d[0]) - yScale(d[1]);
						});
				}

				// need to render different parts of the chart multiple times to get their height and width
				// after getting those values, we need to change the scale and domain to the new values and can redraw them to the proper proportions

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
