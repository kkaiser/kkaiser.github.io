"use strict";

// create bounding box
var projection_map3 = d3.geo.mercator();

// global variables
var margin_map3 = {
		top: 20
		, right: 20
		, bottom: 30
		, left: 60
	}
	, width_map3 = 800 - margin.left - margin.right
	, height_map3 = 600 - margin.top - margin.bottom;
var lattop_map3 = 35.1;
var lonleft_map3 = 68.4;
var lonright_map3 = 140;

// add the tooltip area to the webpage
var toolM3 = d3.select("body").append("div")
	.attr("class", "tooltipMap3")
	.style("opacity", "0")
	.style("display", "none");

// make the scale so that the difference of longitude is
// exactly the width of the image
var scale_map3 = (1960 * width_map3) / (lonright_map3 - lonleft_map3);
projection_map3.scale(scale_map3);

// translate the origin of the map to [0,0] as a start,
projection_map3.translate([0, 0]);

// check where your top left coordinate is projected
var trans_map3 = projection_map3([lonleft_map3, lattop_map3]);

// translate your map in the negative direction of that result
projection_map3.translate([-1 * trans_map3[0], -1 * trans_map3[1]]);
var path_map3 = d3.geo.path()
	.projection(projection_map3);

// Create SVG element
var svg_map3 = d3.select("div#map3").append("svg")
	.attr("width", width_map3 + margin_map3.left + margin_map3.right)
	.attr("height", height_map3 + margin_map3.top + margin_map3.bottom)
	.append("g")
	.attr("transform", "translate(" + margin_map3.left + "," + margin_map3.top + ")");

// define drawing groups, need to be in proper order (top element last)
svg_map3.append("g").attr("id", "path_m3")
svg_map3.append("g").attr("id", "nodes_m3")
svg_map3.append("g").attr("id", "centroids_m3")

d3.json("data/json/afg.geojson", function(json) {
	svg_map3.select("#path_m3").selectAll("path")
		.data(json.features)
		.enter()
		.append("path")
		.attr("d", path_map3)
		.attr("fill", function(d) {
			return d.properties.fill;
		})
		.attr("stroke", function(d) {
			return d.properties.stroke
		})
		.attr("stroke-width", function(d) {
			return d.properties['stroke-width']
		})
		// Add and remove a hover effect with tooltip
		.on("mouseover", function(d) {
			d3.select(this)
				.transition()
				.attr('fill', 'rgb(180,180,180)')
			toolM3
				.transition()
				.duration(500)
				.style("opacity", "1")
				.style("display", "block")
			toolM3
				.html(
					"Province <strong><font color='red'>" + d.properties.province + "</font></strong> in region <font color='" +
					d.properties.fill + "'>" + d.properties.region + "</font>"
				)
				.style("top", (d3.event.pageY - 100) + "px")
				.style("left", (d3.event.pageX - 100) + "px");

		})
		.on("mouseout", function(d) {
			d3.select(this)
			d3.select(this).transition().duration(500)
				.attr('fill', function(d) {
					return d.properties.fill
				})
			toolM3.transition()
				.duration(500)
				.style("opacity", "0")
				.style("display", "none")
		});

	d3.csv("data/csv/v5/geodata_kabul.csv", function(error, data) {
		if (error) throw error;

		// node vars
		var data_blue = [];
		var data_red = [];
		var data_green = [];
		// centroid vars
		var centr_e = [];
		var centr_f = [];
		var centr_n = [];
		// Add a LatLng object to each item in the dataset
		data.forEach(function(d) {
			d.LatLng = new L.LatLng(d.lat, d.lon)
			// append respective values
			if (d.label == 'friendly') {
				data_green.push(d);
			} else if (d.label == 'enemy') {
				data_red.push(d);
			} else if (d.label == 'neutral') {
				data_blue.push(d);
			} else {
				console.log("object not used: " + d)
			}
		});

		// made with: http://www.herethere.net/~samson/php/color_gradient/
		function get_node_colors(d) {
			if (d.label == 'friendly') {
				if (d.cluster == 0) {
					return "#90EE90";
				} else if (d.cluster == 1) {
					return "#60AF6A";
				} else if (d.cluster == 2) {
					return "#307045";
				} else if (d.cluster == 3) {
					return "#013220";
				}
			} else if (d.label == 'enemy') {
				if (d.cluster == 0) {
					return "#F88379";
				} else if (d.cluster == 1) {
					return "#DA625A";
				} else if (d.cluster == 2) {
					return "#BC413C";
				} else if (d.cluster == 3) {
					return "#9E201E";
				} else if (d.cluster == 4) {
					return "#800000";
				}
			} else if (d.label == 'neutral') {
				if (d.cluster == 0) {
					return "#89CFF0";
				} else if (d.cluster == 1) {
					return "#5B8AF5";
				} else if (d.cluster == 2) {
					return "#2D45FA";
				} else if (d.cluster == 3) {
					return "#0000FF";
				}
			}
		}

		svg_map3.select("#nodes_m3").selectAll("circle")
			.data(data_green)
			.enter()
			.append("circle")
			.attr("cx", function(d) {
				return projection_map3([d.lon, d.lat])[0];
			})
			.attr("cy", function(d) {
				return projection_map3([d.lon, d.lat])[1];
			})
			.attr("r", 3)
			.style("fill", function(d) {
				return get_node_colors(d);
			})
			.style("opacity", 0.45);

		d3.json("data/json/centr.json", function(error, c_dat) {
			if (error) throw error;

			// append respective values
			c_dat.enemy.forEach(function(d) {
				centr_e.push(new L.LatLng(d[0], d[1]));
			});
			c_dat.friendly.forEach(function(d) {
				centr_f.push(new L.LatLng(d[0], d[1]));
			});
			c_dat.neutral.forEach(function(d) {
				centr_n.push(new L.LatLng(d[0], d[1]));
			});


			// centroids as white circle
			svg_map3.select("#centroids_m3").selectAll("circle")
				.data(centr_f)
				.enter()
				.append("circle")
				.attr("cx", function(d) {
					return projection_map3([d.lng, d.lat])[0];
				})
				.attr("cy", function(d) {
					return projection_map3([d.lng, d.lat])[1];
				})
				.attr("r", 10)
				.style("stroke-opacity", 0.6)
				.style("stroke-width", 5)
				.style("stroke", "white")
				.style("fill", "none")
				.style("opacity", 1);
		})

		// redraw each category every 8 seconds
		var i = 0;
		var inter = setInterval(function() {
			i++;
			if (i == 1) {
				update_map(data_green, centr_f);
			} else if (i == 2) {
				update_map(data_red, centr_e);
			} else if (i == 3) {
				i = 0;
				update_map(data_blue, centr_n);
			}
		}, 8000);

		function update_map(dat, centr) {
			
			// make glowing effect		
			var animate = function() {
				d3.select(this).transition().duration(1500)
				.attr("r", 7).each("end", function () {
				d3.select(this).transition().duration(1500)
					.attr("r", 3).each("end", animate)});
			}
			
			svg_map3.select("#nodes_m3").selectAll("circle")
				.data(dat)
				.transition().duration(1000)
				.attr("cx", function(d) {
					return projection_map3([d.lon, d.lat])[0];
				})
				.attr("cy", function(d) {
					return projection_map3([d.lon, d.lat])[1];
				})
				.attr("r", 3).each("end", animate)
				.style("fill", function(d) {
					return get_node_colors(d);
				})
				.style("opacity", 0.45);
			
			svg_map3.select("#centroids_m3").selectAll("circle").remove()
			svg_map3.select("#centroids_m3").selectAll("circle")
				.data(centr)
				.enter()
				.append("circle")
				.attr("cx", function(d) {
					return projection_map3([d.lng, d.lat])[0];
				})
				.attr("cy", function(d) {
					return projection_map3([d.lng, d.lat])[1];
				})
				.attr("r", 10)
				.style("stroke-opacity", 0.6)
				.style("stroke-width", 5)
				.style("stroke", "white")
				.style("fill", "none")
				.style("opacity", 1);
		}
	});
});
