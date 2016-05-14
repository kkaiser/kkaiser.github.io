"use strict";
// create bounding box          
var projection_map3 = d3.geo.mercator();
//global variables
var margin_map3 = {top: 20, right: 20, bottom: 30, left: 60},
width_map3 = 860 - margin.left - margin.right,
height_map3 = 600 - margin.top - margin.bottom;
var lattop_map3 = 	35.1;
var lonleft_map3 = 68.4;
var lonright_map3 = 140;

// add the tooltip area to the webpage
var toolM3 = d3.select("body").append("div")
			.attr("class", "tooltipMap3")
			.style("opacity", "0")
			.style("display", "none");

// make the scale so that the difference of longitude is
// exactly the width of the image
var scale_map3 = (1960*width_map3)/(lonright_map3-lonleft_map3);
projection_map3.scale(scale_map3);

// translate the origin of the map to [0,0] as a start,
projection_map3.translate([0,0]);

// check where your top left coordinate is projected
var trans_map3 = projection_map3([lonleft_map3,lattop_map3]);

// translate your map in the negative direction of that result
projection_map3.translate([-1*trans_map3[0],-1*trans_map3[1]]);
var path_map3 = d3.geo.path()
			  .projection(projection_map3);

// Create SVG element
var svg_map3 = d3.select("div#map3").append("svg")
 .attr("width", width_map3 + margin_map3.left + margin_map3.right)
 .attr("height", height_map3 + margin_map3.top + margin_map3.bottom)
 .append("g")
 .attr("transform", "translate(" + margin_map3.left + "," + margin_map3.top + ")");

d3.json("data/json/afg.geojson", function(json) {
  svg_map3.selectAll("path")
  .data(json.features)
  .enter()
  .append("path")
  .attr("d", path_map3)
  .attr("fill", function(d){
	return d.properties.fill;
  })
  .attr("stroke", function(d){
	return d.properties.stroke
  })
  .attr("stroke-width", function(d){
	return d.properties['stroke-width']
  })
	// Add and remove a hover effect with tooltip
	.on("mouseover", function(d){
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
	.on("mouseout", function(d){
		d3.select(this)
			d3.select(this).transition().duration(500)
				.attr('fill', function(d){
					return d.properties.fill
				})
		toolM3.transition()
			.duration(500)
			.style("opacity", "0")
			.style("display", "none")
	});
  
  d3.csv("data/csv/v5/geodata_kabul.csv", function(data) {
		svg_map3.selectAll("circle")
		.data(data)
		.enter()
		.append("circle")
		.attr("cx", function(d) {
			return projection_map3([d.lon, d.lat])[0];
		})
		.attr("cy", function(d) {
			return projection_map3([d.lon, d.lat])[1];
		})  
		.attr("r", 3)
		.style("fill", function(d){
		  if (d.label == 1){
			return "#FF0000"
		  }
		  else if (d.label==2){
			return "#00FF00"
		  }
		  else if (d.label==3){
			return "#0000FF"
		  }
		})
		.style("opacity", 0.35);
  });
});
