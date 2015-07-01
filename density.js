
function density(data) {

    // defaults
    var width = 800,
        height = 400,
        fill = "rgba(15, 155, 155, 0.6)",
        tickFormat = null,
        numTicks = null,
        target = "body",
        axisLabel = null;

    var chart = (function () {

      d3.json(data, function(dat) {

      var getMax = function(vals, y_val) {
          var ind,
              max;
          if (y_val) {
              ind = 1;
              max = d3.max(vals.map(function(d) { return d[ind]; }));
              return Math.ceil(max*100)/93;
          } else {
              ind = 0;
              max = d3.max(vals.map(function(d) { return d[ind]; }));
              return max;
          }
      };

      var density_data = dat.sort(d3.ascending);
      var extent = d3.extent(density_data),
          bw = science.stats.bandwidth.nrd0(density_data), // used in R's bw.nrd0() in stats package
          kde = science.stats.kde().sample(density_data),
          kde_vals = kde(d3.range(extent[0], extent[1], bw/2))
          w = width,
          h = height,
          margin = {top: 10, right: 22, bottom: 50, left: 22},
          x = d3.scale.linear().domain([extent[0], getMax(kde_vals, false)]).range([0, w]),
          y = d3.scale.linear().domain([0, getMax(kde_vals, true)]).range([0, h]);

      var uid = Math.random().toString(36).substr(2);

      var svg = d3.select(target)
          .append("div")
          .classed("density-chart", true)
          .append("svg")
          .attr("width", w + margin.left + margin.right)
          .attr("height", h + margin.top + margin.bottom);

      var original = svg.append("g")
           .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var chart = svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      var rect = original.append("clipPath")
                    .attr("id", "clip")
                    .append("rect")
                    .attr("height", h);

      var area = d3.svg.area()
          .interpolate("cardinal")
          .x(function(d) { return x(d[0]); })
          .y0(h)
          .y1(function(d) { return h - y(d[1]); });

      var filled_density = chart.selectAll("path")
          .data(d3.values(science.stats.bandwidth))
          .enter().append("path")
          .attr("d", function() {
            return area(kde_vals);
          })
          .classed("density-filled", true)
          .attr("clip-path", "url(#clip)")
          .style("fill", fill);

        var unfilled_density = original.selectAll("path")
              .data(d3.values(science.stats.bandwidth))
              .enter().append("path")
              .attr("d", function() {
                return area(kde_vals);
            }).
            classed("density-original", true);

        var viz = svg.append("rect")
              .attr("width", w)
              .attr("height", h)
              .attr("fill", "transparent")
              .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      // add x-axis
      var x_axis = d3.svg.axis()
                    .scale(x)
                    .orient("bottom")
                    .outerTickSize(0)
                    .tickFormat(tickFormat)
                    .ticks(numTicks);

      svg.append("g")
        .classed("density-xaxis", true)
        .attr("transform", "translate(" + margin.left + "," + (h + margin.top) + ")")
        .call(x_axis)
        .append("text")
        .classed("density-axis-label", true)
        .attr("y", 40)
        .attr("x", width/2)
        .attr("text-anchor", "middle")
        .text(axisLabel);

      var rule = chart
            .append("line")
            .attr("class", "density-rule")
            .style("stroke-dasharray", ("3, 3"))
            .attr("y1", 15)
            .attr("y2", h);

      var perc_lab = svg
            .append("text")
            .attr("y", 10 + margin.top);

      viz.on("mousemove", function() {
             var mousex = d3.event.pageX;

             rect.attr("width", mousex - margin.left - 7);

             var percentile = d3.format(".1%")(
                 d3.mean(density_data.map(function(d) {
                 return d < x.invert(mousex - margin.left - 7);
             }))
             );

             perc_lab.attr("x", mousex - 5)
                .text(percentile)
                .attr("text-anchor", "middle")
                .attr("font-size", 12);

             rule.attr("x1", mousex - margin.left - 7)
                    .attr("x2", mousex - margin.left - 7);
             })

    });

    return {
        target: function(value) {
          if (!arguments.length) return target;
          target = value;
          return chart;
        },

        width: function(value) {
          if (!arguments.length) return width;
          width = value;
          return chart;
        },

        height: function(value) {
          if (!arguments.length) return height;
          height = value;
          return chart;
        },

        fill: function(value) {
            if (!arguments.length) return fill;
            fill = value;
            return chart;
        },

        numTicks: function(value) {
            if (!arguments.length) return numTicks;
            numTicks = value;
            return chart;
        },

        tickFormat: function(value) {
            if (!arguments.length) return tickFormat;
            tickFormat = value;
            return chart;
        },

        axisLabel: function(value) {
            if (!arguments.length) return axisLabel;
            axisLabel = value;
            return chart;
        }
    };

}());

return chart;

}
