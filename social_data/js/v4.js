/*
* initial source: https://bost.ocks.org/mike/leaflet/
*/

// leaflet map tiles
L.mapbox.accessToken = 'pk.eyJ1IjoibXJrYWlrZXYiLCJhIjoiY2luZGF4NzA2MDA1Z3d6bHlwbWZ4YWI4YiJ9.5tLR_2fjmu95FYEaEAljYw';
var street = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	attribution: '&copy; <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var terrain = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var googlesat = L.tileLayer('https://mt1.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
	attribution: "Map data &copy;2016 Google"
});
var map = L.map('map', {
	center: [34, 66],
	zoom: 6,
	layers: [street]
});

// control map layers
var baseLayers = {
	"Streets (Mapbox)": street,
	"Terrain (OSM)": terrain,
	"Satellite (Google)": googlesat
};

var d3Layer = L.Class.extend({
	initialize: function() {
		return;
	},
	onAdd: function(map) {
		svgMap.style("display", "block");
		d3.select(".legend").style("display", "block");
	},
	onRemove: function(map) {
		svgMap.style("display", "none");
		d3.select(".legend").style("display", "none");
	},
});

var svgLayer = new d3Layer();

var overlays = {
	"GeoJSON": svgLayer
};
L.control.layers(baseLayers, overlays).addTo(map);

// Popup with latlong where you clicked
var popup = L.popup();

function onMapClick(e) {
	popup
		.setLatLng(e.latlng)
		.setContent("Position: <b>" + e.latlng.toString() + "</b>")
		.openOn(map);
}

map.on('click', onMapClick);

// d3 map data
var svgMap = d3.select(map.getPanes().overlayPane).append("svg"),
	g = svgMap.append("g").attr("class", "leaflet-zoom-hide");
var legend;
// add the tooltip area to the webpage
var tool = d3.select("body").append("div")
			.attr("class", "tooltipMap")
			.style("opacity", "0")
			.style("display", "none");

// mapdata from: https://ckhickey.cartodb.com/tables/afghanistan_provinces_geometry/public
d3.json("data/json/afg.geojson", function(error, collection) {
	if (error) throw error;

	var transform = d3.geo.transform({
			point: projectPoint
	}),
		path = d3.geo.path().projection(transform);

	var feature = g.selectAll("path")
		.data(collection.features)
		.enter().append("path");

	var items = collection.features;
	var legend_data = [];
	var lookup = {};

	// function to get distinct regions for legend
	for (var item, i = 0; item = items[i++];) {
		var name = item.properties.region;
		var color = item.properties.fill;

		if (!(name in lookup)) {
			lookup[name] = 1;
			legend_data.push({
				color: color,
				name: name
			});
		}
	}
	legend = d3.select("#map").append("svg")
		.attr("class", "legend")
		.attr("width", 100)
		.attr("height", 100)
		.style("background-color", "rgba(255, 255, 255, 0.8)")
		.style("top", "500px")
		.selectAll("g")
		.data(legend_data)
		.enter().append("g")
		.attr("transform", function(d, i) { return "translate(0," + (i * 20) + ")"; });

	legend.append("rect")
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", function(d) { return d.color; });

	legend.append("text")
		.attr("x", 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.text(function(d) { return d.name; });

	// Handle zoom of the map and repositioning of d3 overlay
	map.on("viewreset", reset);
	reset();

	// Reposition the SVG to cover the features.
	function reset() {
		var bounds = path.bounds(collection),
			topLeft = bounds[0],
			bottomRight = bounds[1];
		svgMap.attr("width", bottomRight[0] - topLeft[0])
		
							.attr("height", bottomRight[1] - topLeft[1])
			.style("left", topLeft[0] + "px")
			.style("top", topLeft[1] + "px");
		g.attr("transform", "translate(" + -topLeft[0] + "," + -topLeft[1] + ")");

		// Add colors and other fillings for every feature
		feature.attr("d", path)
		// Add fillings from GeoJSON
		.style("fill", function(d) {
			return d.properties['fill'];
		})
		.style("fill-opacity", function(d) {
			return d.properties['fill-opacity'];
		})
		.style("stroke", function(d) {
			return d.properties['stroke'];
		})
		.style("stroke-opacity", function(d) {
			return d.properties['stroke-opacity'];
		})
		.style("stroke-width", function(d) {
			return d.properties['stroke-width'];
		})
		// Add and remove a hover effects with tooltip
		.on("mouseover", function(d){
			color = d3.rgb(d.properties['fill'])
			d3.select(this)
				.transition()
				.duration(500)
				.style('fill', color.darker([1.8]))
			tool
				.transition()
				.duration(500)
				.style("opacity", "1")
				.style("display", "block")
			tool
				.html(
					"Province <strong><font color='red'>" + d.properties.province + "</font></strong> in region <font color='" + 
					d.properties.fill + "'>" + d.properties.region + "</font> is commanded by: " + d.properties.countries
				)
				.style("top", (d3.event.pageY - 150) + "px")
				.style("left", (d3.event.pageX - 100) + "px");

		})
		.on("mouseout", function(d){
			d3.select(this)
				.transition()
				.duration(500)
				.style('fill', d.properties['fill'])
			tool.transition()
				.duration(500)
				.style("opacity", "0")
				.style("display", "none")
	});
	}
	// Use Leaflet to implement a D3 geometric transformation.
	function projectPoint(x, y) {
		var point = map.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}
});
