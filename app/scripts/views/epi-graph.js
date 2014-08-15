/*global WHO, Backbone, JST*/

WHO.Views = WHO.Views || {};

(function () {
    'use strict';

    WHO.Views.epiGraph = Backbone.View.extend({

        events: {},
        initialize: function () {

            // Show spinner until load
            this.spinner = new Spinner({
                color: '#888',
                length: 2,
                speed: 0.8
            }).spin(document.getElementById('epi-graph-loader'));

        },

        load: function() {

            this.listenToOnce(this.collection, 'loaded', this.render);
            this.collection.query();
        },

        drawChart: function(allWeeks) {

          var margin = {top: 20, right: 20, bottom: 100, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

          var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1);

          var y = d3.scale.linear()
            .rangeRound([height, 0]);

          var color = d3.scale.ordinal()
            .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

          var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(d3.time.format("%m-%d-%Y"));

          var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .tickFormat(d3.format(".2s"));

          var svg = d3.select("#epi-graph").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

          var data = allWeeks;

          color.domain(d3.keys(data[0]).filter(function(key) { return key !== "week"; }));

          data.forEach(function(d) {
            var y0 = 0;
            d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
            d.total = d.ages[d.ages.length - 1].y1;
          });

          x.domain(data.map(function(d) { return d["week"]; }));
          y.domain([0, d3.max(data, function(d) { return d.total; }) + 100]);

          svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function(d) {
                return "rotate(-65)"
                });

          svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Cases");

          var state = svg.selectAll(".state")
            .data(data)
          .enter().append("g")
            .attr("class", "g")
            .attr("transform", function(d) { return "translate(" + x(d["week"]) + ",0)"; });

          state.selectAll("rect")
            .data(function(d) { return d.ages; })
          .enter().append("rect")
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.y1); })
            .attr("height", function(d) { return y(d.y0) - y(d.y1); })
            .style("fill", function(d) { return color(d.name); });

          var legend = svg.selectAll(".legend")
            .data(color.domain().slice().reverse())
          .enter().append("g")
            .attr("class", "legend")
            .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

          legend.append("rect")
            .attr("x", width - 18)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

          legend.append("text")
            .attr("x", width - 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d; });

          this.spinner.stop();
        },

        render: function () {

            var d = Date.parse('01/05/2014'),
                allWeeks = [], i = 0,
                model;

            while (d < this.collection.models[this.collection.models.length - 1].get("datetime")) {
                allWeeks[i] = {week: new Date(d), Suspected: 0, Probable: 0, Confirmed: 0};
                d += (7*1000*3600*24);
                i++;
            }

            for(var j = 0, jj = this.collection.models.length; j < jj; ++j) {
                model = this.collection.models[j];
                for (var w = 0; w < allWeeks.length; ++w) {
                  if ((model.get("datetime") - Date.parse(allWeeks[w].week) < (7*24*3600*1000)) && (model.get("datetime") > Date.parse(allWeeks[w].week)) && (model.get("Category") != 'For Aggregates'))
                    allWeeks[w][model.get("Category")] += 1;
                }
            }

            this.drawChart(allWeeks);
        },


    });

})();
