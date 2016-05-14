"use strict";

// global variables
var margin_v5 = {
		top: 20
		, right: 10
		, bottom: 150
		, left: 100
	}
	, width_v5 = 1060 - margin_v5.left - margin_v5.right
	, height_v5 = 500 - margin_v5.top - margin_v5.bottom;

var x0_v5 = d3.scale.ordinal()
	.rangeRoundBands([0, width_v5], .1);

var x1_v5 = d3.scale.ordinal();

var y_v5 = d3.scale.linear()
	.range([height_v5, 0]);

var color_v5 = d3.scale.ordinal()
	.range(["#ff8c00", "#4169E1"]);

var xAxis_v5 = d3.svg.axis()
	.scale(x0_v5)
	.orient("bottom");

var yAxis_v5 = d3.svg.axis()
	.scale(y_v5)
	.orient("left")
	.tickFormat(d3.format(".2s"));

// add the tooltip area to the webpage
var tooltip_v5 = d3.select("div#vis5").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

var svg_v5 = d3.select("div#vis5").append("svg")
	.attr("width", width_v5 + margin_v5.left + margin_v5.right)
	.attr("height", height_v5 + margin_v5.top + margin_v5.bottom)
	.append("g")
	.attr("transform", "translate(" + margin_v5.left + "," + margin_v5.top + ")");

// read data from file
d3.csv("data/csv/v5/clf_top11_p.csv", function(error, data) {
	if (error) throw error;

	var forceNames = d3.keys(data[0]).filter(function(key) {
		return key !== "Cat";
	});
	data.forEach(function(d) {
		d.forces = forceNames.map(function(name) {
			return {
				name: name
				, value: +d[name]
			};
		});
	});

	x0_v5.domain(data.map(function(d) {
		return d.Cat;
	}));
	x1_v5.domain(forceNames).rangeRoundBands([0, x0_v5.rangeBand()]);
	y_v5.domain([0, d3.max(data, function(d) {
		return d3.max(d.forces, function(d) {
			return d.value;
		});
	})]);

	svg_v5.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height_v5 + ")")
		.call(xAxis_v5)
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", "-.55em")
		.attr("transform", "rotate(-45)");

	svg_v5.append("g")
		.attr("class", "y axis")
		.call(yAxis_v5)
		.append("text")
		.attr("transform", "translate(90,-25)")
		.attr("y", 6)
		.attr("dy", ".71em")
		.style("text-anchor", "end")
		.text("percent (%)");

	var cat = svg_v5.selectAll(".cat")
		.data(data)
		.enter().append("g")
		.attr("class", "cat")
		.attr("transform", function(d) {
			return "translate(" + x0_v5(d.Cat) + ",0)";
		});

	cat.selectAll(".bar")
		.data(function(d) {
			return d.forces;
		})
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("width", x1_v5.rangeBand())
		.attr("x", function(d) {
			return x1_v5(d.name);
		})
		.attr("y", function(d) {
			return y_v5(d.value);
		})
		.attr("height", function(d) {
			return height_v5 - y_v5(d.value);
		})
		.style("fill", function(d) {
			return color_v5(d.name);
		});

	d3.selectAll("div#vis5 rect")
		.on("mouseover", function(d) {
			tooltip_v5.transition()
				.duration(200)
				.style("opacity", .9);
			tooltip_v5.html("<div><b>" + d.value + "</b></div>")
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		})
		.on("mouseout", function(d) {
			tooltip_v5.transition()
				.duration(500)
				.style("opacity", 0);
		});

	var legend = svg_v5.selectAll(".legend")
		.data(forceNames.slice().reverse())
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", function(d, i) {
			return "translate(120," + i * 20 + ")";
		});

	legend.append("rect")
		.attr("x", width_v5 - 760)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", color);

	legend.append("text")
		.attr("x", width_v5 - 770)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(function(d) {
			return d;
		})
		.style("fill", color);

	//On select, update with new data
		d3.selectAll("#opts_v5")
		.on('change', function() {
			var ID = d3.select(this).property('value');
			if (ID == "clf") {
				update_hist_v5("data/csv/v5/clf_top11_p.csv");
			} else if (ID == "rf") {
				update_hist_v5("data/csv/v5/rf_top11_p.csv")
			} else if (ID == "tr") {
				update_hist_v5("data/csv/v5/tr_top11_p.csv")
			} else if (ID == "nc") {
				update_hist_v5("data/csv/v5/nc_top11_p.csv")
			}
		})

	function update_hist_v5(filename, color) {
		d3.csv(filename, function(error, data) {
			if (error) throw error;

			var forceNames = d3.keys(data[0]).filter(function(key) {
				return key !== "Cat";
			});
			data.forEach(function(d) {
				d.forces = forceNames.map(function(name) {
					return {
						name: name
						, value: +d[name]
					};
				});
			});

			x0_v5.domain(data.map(function(d) {
				return d.Cat;
			}));
			x1_v5.domain(forceNames).rangeRoundBands([0, x0_v5.rangeBand()]);
			y_v5.domain([0, d3.max(data, function(d) {
				return d3.max(d.forces, function(d) {
					return d.value;
				});
			})]);

			//Update Y axis
			svg_v5.select(".y.axis")
				.transition()
				.duration(1000)
				.ease("elastic")
				.call(yAxis_v5);

			var cat = svg_v5.selectAll(".cat")
				.data(data)
				.attr("class", "cat")
				.attr("transform", function(d) {
					return "translate(" + x0_v5(d.Cat) + ",0)";
				});

			cat.selectAll(".bar")
				.data(function(d) {
					return d.forces;
				})
				.transition()
				.duration(1500)
				.ease("elastic")
				.attr("class", "bar")
				.attr("width", x1_v5.rangeBand())
				.attr("x", function(d) {
					return x1_v5(d.name);
				})
				.attr("y", function(d) {
					return y_v5(d.value);
				})
				.attr("height", function(d) {
					return height_v5 - y_v5(d.value);
				})
				.style("fill", function(d) {
					return color_v5(d.name);
				});

			d3.selectAll("div#vis5 rect")
				.on("mouseover", function(d) {
					tooltip_v5.transition()
						.duration(200)
						.style("opacity", .9);
					tooltip_v5.html("<div><b>" + d.value + "</b></div>")
						.style("left", (d3.event.pageX) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
				})
				.on("mouseout", function(d) {
					tooltip_v5.transition()
						.duration(500)
						.style("opacity", 0);
				});
		});
	}
});
