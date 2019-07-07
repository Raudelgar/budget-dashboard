function BarChart(params) {
  let o = {
    el: null,
    init: function(element, width, height, json, callback) {
      let margin = 40; //svg margin
      let bottomSpacing = 0;
      let legendHeight = 0;
      let xAxisHeight = 0;
      let yAxisWidth = 0;
      let yMaxValue = 0;
      let yAxisEl;
      let metaData;
      let dataSet;
      let svg;

      element =
        typeof element === "string"
          ? document.body.querySelector(element)
          : element;
      width = Math.ceil(element.getBoundingClientRect().width) - margin;
      height = Math.ceil(element.getBoundingClientRect().height) - margin;
      o.el = element;

      if (width < 0 && height < 0) {
        return;
      }

      metaData = json.format;
      dataSet = {
        content: json.data
      };

      //this will convert the date format on the labels from the database
      for (let i = 0; i < json.data.length; i++) {
        let time = new Date(json.data[i].label).getTime();
        let date = formatter.formatDate(time, "MMM-YYYY").toUpperCase();
        json.data[i].label = date;
      }

      svg = d3
        .select(element)
        .append("svg")
        .attr("width", width + margin)
        .attr("height", height + margin)
        .append("g")
        .attr("transform", "translate(" + margin / 2 + ", " + margin / 2 + ")");

      getValues();
      renderChart();
      callback ? callback(true) : 0;

      function getValues() {
        dataSet.content.map(d => {
          yMaxValue = yMaxValue > d.value ? yMaxValue : d.value;
        });
      }

      function renderChart() {
        let xScale, yScale;

        let colorPalette = d3.scaleOrdinal().range(
          (function() {
            if (metaData.muteColors) {
              let a = [];

              let dbBlues = ["#0018a8", "#0c2340", "#00a3e0", "#4ac9e3"];

              let dbNeutrals = ["#425563", "#b7b09c", "#a4bcc2", "#768692"];

              return dbNeutrals;
            } else {
              return [
                // '#8475e0', //added this color
                "#a145b3", //instead of #671e75
                "#da1884",
                "#e4002b",
                "#f4364c",
                "#e57200",
                "#00c7b1",
                "#00a82d",
                "#6ed619",
                "#cedc00",
                "#fce300",
                "#ffc845",
                "#b7b09c",
                "#a4bcc2",
                "#768692"
              ];
            }
          })()
        );

        function setScales() {
          // set x scale
          xScale = d3
            .scaleBand()
            .rangeRound([0, width - yAxisWidth])
            .paddingInner(0.3)
            .paddingOuter(0.5);

          // set y scale
          yScale = d3
            .scaleLinear()
            .rangeRound([height - (legendHeight + xAxisHeight), 0]);
        }

        function setDomains() {
          xScale.domain(
            dataSet.content.map(d => {
              return d.label;
            })
          );

          yScale.domain([0, yMaxValue * 1.15]);
        }

        function renderYAxis(remove) {
          svg
            .append("g")
            .attr("class", "axis yaxis")
            .call(d3.axisLeft(yScale));

          yAxisEl = svg.select("g.yaxis");
          yAxisWidth = Math.ceil(yAxisEl.node().getBoundingClientRect().width);
          svg
            .select("g.yaxis")
            .attr(`transform`, `translate(${yAxisWidth}, 0)`);

          if (remove) {
            yAxisEl.remove();
          }
        }

        function renderXAxis(remove) {
          svg
            .append("g")
            .attr("class", "axis xaxis")
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-10")
            .attr("dy", "-6")
            .attr("transform", function(d) {
              return "rotate(-90)";
            });

          let xAxisEl = svg.select("g.xaxis");

          xAxisHeight =
            Math.ceil(xAxisEl.node().getBoundingClientRect().height) + 10; //10 padding between the xaxis and the legend
          xAxisEl.attr(
            "transform",
            `translate(${yAxisWidth}, ${height - (legendHeight + xAxisHeight)})`
          );

          if (remove) {
            xAxisEl.remove();
          }
        }

        function renderGrid() {
          let makeXLines = () => d3.axisLeft().scale(yScale);

          svg
            .append("g")
            .attr("class", "grid")
            .attr("transform", `translate(${yAxisWidth}, ${0})`)
            .call(
              makeXLines()
                .tickSize(yAxisWidth - width, 0, 0)
                .tickFormat("")
            );
        }

        function renderStack() {
          let h = height - (legendHeight + xAxisHeight);

          let stack = svg
            .append("g")
            .attr("class", "stack")
            .attr("transform", `translate(${yAxisWidth}, ${0})`);

          //Add Bar Rect
          let stackBar = stack
            .selectAll("rect")
            .data(dataSet.content)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .on("mouseover", function(d, i) {
              tooltip.update({ data: d, meta: metaData });
            })
            .on("mouseout", function(d, i) {
              tooltip.hide();
            })
            .attr("width", xScale.bandwidth())
            .attr("height", d => {
              return h - yScale(d.value);
            })
            .attr("x", d => xScale(d.label))
            .attr("y", d => yScale(d.value))
            // .attr('fill', palette[metaData.color]); temporary comment out
            .attr("fill", function() {
              return colorPalette(0);
            });
        }

        setScales();
        setDomains();

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
    fini: function() {
      // console.log('this is your destroy function');
    },
    update: function() {
      o.el.innerHTML = "";

      window.requestAnimationFrame(function() {
        o.init(o.el, o.params.width, o.params.height, o.params.json, function(
          response
        ) {
          // console.log('re-rendered chart:', o);
        });
      });
    }
  };

  o.params = params;
  return o;
}
