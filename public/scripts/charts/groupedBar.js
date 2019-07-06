function GroupedBarChart(params){
	let o = {
        init: function(element, width, height, json, callback) {
            let margin = 40; //svg margin
            let bottomSpacing = 10;
			let legendHeight = 0;
			let xAxisHeight = 0;
			let yAxisWidth = 0;
			let yMaxValue;
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
				columns: [],
				columnsActive: (function(){
					let o = {};

					for(let k in json.data[0].values){
						o[k] = true;
					}

					return o;
				})()
            };

			svg = d3
				.select(element)
				.append('svg')
				.attr('width', width)
				.attr('height', height);

			getValues();
			renderChart();
			callback ? callback(true) : 0;

			function getValues(){
				dataSet.columns = [];

				for(let k in dataSet.columnsActive){
					if(dataSet.columnsActive[k]){
						dataSet.columns.push(k);
					}
				}

				dataSet.content.forEach(function(d, i){
					let t = 0;
					let a = [];

					dataSet.columns.forEach(function(c, k){
						let obj = {};
						let max = d.values[c] ? d.values[c] : 0;

						t = max > t ? max : t;
						obj.key = c;
						obj.value = d.values[c];
						a.push(obj);
					});

					dataSet.content[i].yTotal = t;
					dataSet.content[i].grouped = a;
				});

				yMaxValue = d3.max(dataSet.content, function(d){
					return d.yTotal;
				});
			}

			function renderChart(){
				let xScale0;
				let xScale1;
				let yScale;

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
					// set x scale
					xScale0 = d3
						.scaleBand()
						.rangeRound([0, width - yAxisWidth])
						.paddingInner(0.01);

					xScale1 = d3
						.scaleBand()
						.padding(0.05);

					// set y scale
					yScale = d3
						.scaleLinear()
						.rangeRound([height - (legendHeight + xAxisHeight), 0]);
				}

				function setDomains(){
					xScale0.domain(
						dataSet.content.map(d => {
							return d.label;
						})
					);

					xScale1
						.domain(dataSet.columns)
						.rangeRound([0, xScale0.bandwidth()]);

					yScale.domain([0, (yMaxValue * 1.05)]);
				}

				function renderYAxis(remove){
					let yAxisEl;

					svg
						.append('g')
						.attr('class', 'axis yaxis')
						.call(d3.axisLeft(yScale));

					yAxisEl = svg.selectAll('g.yaxis');
					yAxisWidth = Math.ceil(yAxisEl.node().getBoundingClientRect().width);

					if(yAxisWidth < 25){
						yAxisWidth = 25; //make sure there is enough space (25px) for 2 digits plus a decimal (example: 3.2)
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
						.attr('fill', function(d, i){
							return colorPalette(i);
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
					legend.attr('transform', `translate(0, ${height - legendHeight})`); //10 px of spacing

                    legendGroups.on('click', function(d, i,el) {
						dataSet.columnsActive[d] = !dataSet.columnsActive[d];
						el[i].setAttribute('inactive', !dataSet.columnsActive[d]);
						updateValues();
					});

					if(remove){
						legend.remove();
					}
				}

				function renderXAxis(remove){
					svg
						.append('g')
						.attr('class', 'axis xaxis')
						.call(d3.axisBottom(xScale0))
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
					let makeXLines = () => d3.axisLeft().scale(yScale);

					svg
						.append('g')
						.attr('class', 'grid')
						.attr('transform', `translate(${yAxisWidth}, ${0})`)
						.call(
							makeXLines()
								.tickSize(yAxisWidth - width, 0, 0)
								.tickFormat('')
						);
				}

				function renderStack(){
                    let h = height - (legendHeight + xAxisHeight);

					svg
						.append('g')
						.attr('class', 'stack')
						.attr('transform', `translate(${yAxisWidth}, ${0})`)
						.selectAll('g')
						.data(dataSet.content)
						.enter()
						.append('g')
						.attr('class', 'segments')
						.attr('transform', d => {
							return `translate(${xScale0(d.label)}, 0)`;
						})
						.on('mouseover', function(d, i){
							tooltip.update({data: d, meta: metaData});
	                	})
						.on('mouseout', function(d, i){
							tooltip.hide();
						})
						.selectAll('rect')
                        .data(d => {
                            return d.grouped;
                        })
						.enter()
						.append('rect')
						.attr('gid', function(d, i){return 'g' + i;})
						.attr('width', xScale1.bandwidth() - 1)
						.attr('height', d => {
							return h - yScale(d.value);
						})
						.attr('x', d => {
							return xScale1(d.key);
						})
						.attr('y', d => {
							return yScale(d.value);
						})
						.attr('fill', function(d, i){
							return colorPalette(i);
						});
				}

				function updateValues(){
					getValues();
					setDomains();

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
						.data(dataSet.content)
						.selectAll('rect')
						.transition(125)
						.attr('width', function(d, i){
							if(dataSet.columnsActive[d.key]){
								return xScale1.bandwidth() - 1;
							}else{
								return 0;
							}
						})
						.attr('height', function(d, i){
							if(dataSet.columnsActive[d.key]){
								return (height - (legendHeight + xAxisHeight)) - yScale(d.value);
							}else{
								return 0;
							}
						})
                        .attr('x', function(d, i,el) {
							if(dataSet.columnsActive[d.key]){
								return xScale1(d.key);
							}else{

								return Number(el[i].getAttribute('x')) + ((xScale1.bandwidth() - 1) / 2);
							}
						})
						.attr('y', function(d, i){
							if(dataSet.columnsActive[d.key]){
								return yScale(d.value);
							}else{
								return height - (legendHeight + xAxisHeight);
							}
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
