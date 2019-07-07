function DonutChart(params) {
  let o = {
    init: function(element, width, height, json, callback) {
      let margin = 40; //svg margin
      let cornerRadius = 5;
      let spacing = 0.01;
      let left;
      let top;
      let radius;
      let innerRadius;
      let growRadius;
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

      left = Math.floor(width / 2);
      top = Math.floor(height / 2);
      radius = Math.floor(Math.min(width, height) / 2);
      innerRadius = radius - 65;
      growRadius = radius + 10;
      metaData = json.format;
      dataSet = json.data;

      svg = d3
        .select(element)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${left}, ${top})`);

      renderChart();
      callback ? callback(true) : 0;

      function renderChart(reset) {
        let path;
        let labl;
        let labl2;

        let colorPalette = d3.scaleOrdinal().range(
          (function() {
            if (metaData.muteColors) {
              let a = [];

              let dbBlues = ["#0018a8", "#0c2340", "#00a3e0", "#4ac9e3"];

              let dbNeutrals = ["#425563", "#768692", "#a4bcc2", "#b7b09c"];

              for (let i = 0, j = 0; i < dataSet.length; i++) {
                a.push(dbNeutrals[j]);
                j = j === dbNeutrals.length - 1 ? 0 : j + 1;
              }

              return a;
            } else {
              return [
                "#8475e0", //added this color
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

        let pie = d3
          .pie()
          .value(function(d) {
            return d.inactive ? null : d.value;
          })
          .sort(null);

        let arc = d3
          .arc()
          .innerRadius(innerRadius)
          .outerRadius(radius)
          .cornerRadius(cornerRadius)
          .padAngle(spacing);

        let pathAnim = function(path, dir) {
          switch (dir) {
            case 0:
              path
                // .transition()
                // .duration(125)
                // .ease('bounce')
                .attr(
                  "d",
                  d3
                    .arc()
                    .innerRadius(innerRadius)
                    .outerRadius(radius)
                    .cornerRadius(cornerRadius)
                    .padAngle(spacing)
                );
              break;
            case 1:
              path
                // .transition()
                // .duration(125)
                .attr(
                  "d",
                  d3
                    .arc()
                    .innerRadius(innerRadius)
                    .outerRadius(growRadius)
                    .cornerRadius(cornerRadius)
                    .padAngle(spacing)
                );
              break;
          }
        };

        let percentify = function(startAngle, endAngle) {
          return (
            Math.round(((endAngle - startAngle) / (2 * Math.PI)) * 1000) / 10 +
            "%"
          );
        };

        // donut
        function renderDonut() {
          path = svg
            .append("g")
            .attr("class", "pathstack")
            .datum(dataSet)
            .selectAll("path")
            .data(pie)
            .enter()
            .append("path")
            .attr("class", "arc")
            .attr("arcid", function(d, i) {
              return "a" + i;
            })
            .attr("d", arc)
            .attr("fill", function(d, i) {
              return colorPalette(i);
            })
            .attr("stroke", function(d, i) {
              return colorPalette(i);
            })
            .each(function(d, i, el) {
              el[i].current = d; // current is used to keep the active data after switching to new data so it can be used for the interpolation animation
            })
            .on("click", function(d, i, el) {
              let thisPath = d3.select(el[i]);
              thisPath.classed("expanded", !thisPath.classed("expanded"));
            })
            .on("mouseover", function(d, i, el) {
              let arcid = d3.select(el[i]).attr("arcid");

              svg
                .select('g.legend g.item[arcid="' + arcid + '"]')
                .classed("over", true);
              tooltip.update({ data: d.data, meta: metaData });
            })
            .on("mouseout", function(d, i, el) {
              let arcid = d3.select(el[i]).attr("arcid");

              svg
                .select('g.legend g.item[arcid="' + arcid + '"]')
                .classed("over", false);
              tooltip.hide();
            });
        }

        // text (values)
        function renderValues() {
          labl = svg
            .append("g")
            .attr("class", "values")
            .datum(dataSet)
            .selectAll("text")
            .data(pie)
            .enter()
            .append("text")
            .attr("hidden", function(d) {
              return !d.value || d.value === null;
            })
            .each(function(d, i, el) {
              let centroid = arc.centroid(d);

              el[i].current = d;

              d3.select(el[i])
                .attr("x", centroid[0])
                .attr("y", centroid[1] - 6)
                .text((metaData.pre || "") + d.value + (metaData.post || ""));
            });
        }

        // text (percents)
        function renderPercents() {
          labl2 = svg
            .append("g")
            .attr("class", "percents")
            .datum(dataSet)
            .selectAll("text")
            .data(pie)
            .enter()
            .append("text")
            .attr("class", "value")
            .attr("hidden", function(d) {
              return !d.value || d.value === null;
            })
            .each(function(d, i, el) {
              let centroid = arc.centroid(d);
              let p = percentify(d.startAngle, d.endAngle);

              el[i].current = d;

              d3.select(el[i])
                .attr("x", centroid[0])
                .attr("y", centroid[1] + 6)
                .text("(" + p + ")");
            });
        }

        // legend
        function renderLegend(reset) {
          let spacing = 5;
          let lgnd = svg
            .append("g")
            .attr("class", "legend")
            .datum(dataSet);

          let brdr = lgnd
            .append("g")
            .attr("class", "border")
            .append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0) //this width will be dynamically set lower based on the dimensions of the labels
            .attr("height", function(d, i) {
              return d.length * spacing * 5 + spacing;
            });

          let lbls = lgnd
            .append("g")
            .attr("class", "labels")
            .selectAll("text")
            .data(pie)
            .enter()
            .append("g")
            .attr("class", "item")
            .attr("arcid", function(d, i) {
              return "a" + i;
            })
            .on("click", function(e, i, el) {
              if (el[i].hasAttribute("inactive")) {
                el[i].removeAttribute("inactive");
                delete d3.select(el[i]).data()[0].data.inactive;
              } else {
                el[i].setAttribute("inactive", true);
                d3.select(el[i]).data()[0].data.inactive = true;
              }

              update();
            })
            .on("mouseover", function(d, i, el) {
              let arcid = d3.select(el[i]).attr("arcid");
              let thisPath = svg.select(
                'g.pathstack path[arcid="' + arcid + '"]'
              );

              thisPath.classed("over", true);
            })
            .on("mouseout", function(d, i, el) {
              let arcid = d3.select(el[i]).attr("arcid");
              let thisPath = svg.select(
                'g.pathstack path[arcid="' + arcid + '"]'
              );

              thisPath.classed("over", false);
            });

          lbls
            .append("rect")
            .attr("class", "indicator")
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", function(d, i) {
              return colorPalette(i);
            })
            .attr("x", spacing)
            .attr("y", function(d, i) {
              return i * spacing * 4 + (i + 1) * spacing;
            });

          lbls
            .append("text")
            .text(function(d, i) {
              let txt =
                d.data.label.length > 20
                  ? d.data.label.slice(0, 17) + "..."
                  : d.data.label;
              return txt;
            })
            .attr("fill", function(d, i) {
              return colorPalette(i);
            })
            .attr("size", function(d, i, el) {
              let labelWidth = el[i].getBoundingClientRect().width;

              if (
                !lgnd.largestLabelWidth ||
                lgnd.largestLabelWidth < labelWidth
              ) {
                lgnd.largestLabelWidth = labelWidth;
              }
            })
            .attr("x", spacing * 6)
            .attr("y", function(d, i) {
              return i * spacing * 4 + (i + 1) * spacing + spacing * 2 + 1;
            });

          brdr.attr("width", Math.ceil(lgnd.largestLabelWidth) + spacing * 7);

          lgnd.attr("transform", function() {
            let legendWidth = brdr.node().getBoundingClientRect().width;
            let legendHeight = brdr.node().getBoundingClientRect().height;

            return (
              "translate(" +
              Math.round(-legendWidth / 2) +
              "," +
              Math.round(-legendHeight / 2) +
              ")"
            );
          });

          lbls
            .append("rect")
            .attr("class", "background")
            .attr("width", lgnd.largestLabelWidth + 30)
            .attr("height", 20)
            .attr("x", spacing)
            .attr("y", function(d, i) {
              return i * spacing * 4 + (i + 1) * spacing;
            });
        }

        //on user action, update the form
        function update(e) {
          // compute the new angles
          path = path.data(pie);
          labl = labl.data(pie);
          labl2 = labl2.data(pie);

          // redraw/animate the arcs and text, text is done this way in order to get interpolation X,Y movement to happen along the arc
          path
            .transition()
            .duration(500)
            .attrTween("d", function(a, i, el) {
              let interpolate = d3.interpolate(el[i].current, a);
              let interpolateText = d3.interpolate(
                el[i].current.value,
                a.value
              );
              let correspondingLabelEl = svg.select(
                "g.values text:nth-child(" + (i + 1) + ")"
              );
              let correspondingPercentEl = svg.select(
                "g.percents text:nth-child(" + (i + 1) + ")"
              );

              el[i].current = interpolate(0);

              d3.select(el[i]).classed("expanded", false); //remove expanded class from all expanded arcs

              return function(t) {
                let animPercentComplete = interpolate(t);
                let centroid = arc.centroid(animPercentComplete);

                correspondingLabelEl
                  // .text((metaData.pre || '') + Math.round(interpolateText(t)) + (metaData.post || ''))
                  .attr("x", centroid[0])
                  .attr("y", centroid[1] - 6)
                  .attr("hidden", function(d) {
                    return !d.value || d.value === null;
                  });

                correspondingPercentEl
                  .text(
                    "(" +
                      percentify(
                        animPercentComplete.startAngle,
                        animPercentComplete.endAngle
                      ) +
                      ")"
                  )
                  .attr("x", centroid[0])
                  .attr("y", centroid[1] + 6)
                  .attr("hidden", function(d) {
                    return !d.value || d.value === null;
                  });

                return arc(animPercentComplete);
              };
            });
        }

        renderDonut();
        renderValues();
        renderPercents();
        renderLegend();
      }
    },
    fini: function() {
      // console.log('this is your destroy function');
    },
    resetData: function() {
      for (let d of o.params.json.data) {
        delete d.inactive;
      }
    },
    update: function() {
      o.el.innerHTML = "";

      window.requestAnimationFrame(function() {
        o.resetData();
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
