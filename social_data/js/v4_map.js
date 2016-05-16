"use strict";

/*
* initial source: https://bost.ocks.org/mike/leaflet/
* choropleth: http://leafletjs.com/examples/choropleth.html
* this map uses leaflet for geoJSON and d3 for other overlays
*/

// leaflet map tiles
var mbAttr = '&copy; <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
L.mapbox.accessToken = 'pk.eyJ1IjoibXJrYWlrZXYiLCJhIjoiY2luZGF4NzA2MDA1Z3d6bHlwbWZ4YWI4YiJ9.5tLR_2fjmu95FYEaEAljYw';
var street_v4 = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	attribution: mbAttr
});

var grayscale_v4 = L.tileLayer('https://api.mapbox.com/v4/mapbox.light/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	attribution: mbAttr
});

var terrain_v4 = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var googlesat_v4 = L.tileLayer('https://mt1.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
	attribution: "Map data &copy;2016 Google"
});

var positron_v4 = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>'
});

// create map in div map2
var map2 = L.map('map2', {
	center: [34, 66],
	zoom: 6,
	layers: [grayscale_v4]
});

// control map layers
var baseLayers_v4 = {
	"Grayscale (Mapbox)": grayscale_v4,
	"Grayscale (CartoDB)":positron_v4,
	"Streets (Mapbox)": street_v4,
	"Terrain (OSM)": terrain_v4,
	"Satellite (Google)": googlesat_v4
};

// this is the CSV info of the voting areas
var el_rows;
// color scale for geoJSON
var cScale;

// this is for putting d3 elements to the front
d3.selection.prototype.moveToFront = function() {
	return this.each(function(){
		this.parentNode.appendChild(this);
	});
};

// TODO: trickery needed because d3 layers are not detected as "added"
var distr_enabled = true;
var knn_enabled = true;
var firstRun = true;
var d3LayerDist_v4 = L.Class.extend({
	initialize: function() {
		return;
	},
	onAdd: function() {
		distr_enabled = true;
		d3.select("div#map2 .districts").style("display", "block");
		// this is for putting d3 elements to the front
		if (knn_enabled) {
			var selk = d3.select("div#map2 .knn");
			selk.moveToFront();
		}
		var sel = d3.select("div#map2 .districts");
		sel.moveToFront();
	},
	onRemove: function() {
		d3.select("div#map2 .districts").style("display", "none");
		distr_enabled = false;
	},
});

var d3LayerKnn_v4 = L.Class.extend({
	initialize: function() {
		return;
	},
	onAdd: function() {
		knn_enabled = true;
		d3.select("div#map2 .knn").style("display", "block");
		// this is for putting d3 elements to the front
		var sel = d3.select("div#map2 .knn");
		sel.moveToFront();
		if (distr_enabled) {
			var seld = d3.select("div#map2 .districts");
			seld.moveToFront();
		}
	},
	onRemove: function() {
		firstRun = false;
		d3.select("div#map2 .knn").style("display", "none");
		knn_enabled = false;
	},
});

// create empty layer
var svgLayerDist_v4 = new d3LayerDist_v4();
var svgLayerKnn_v4 = new d3LayerKnn_v4();
var geojson_layer = L.geoJson(false, {
	style: style,
	onEachFeature: onEachFeature
});

// add the layer groups to control them over the menu
var overlays_v4 = {
	"Districts": svgLayerDist_v4,
	"KNN": svgLayerKnn_v4,
	"GeoJSON": geojson_layer
};
// add layer controls top right corner
L.control.layers(baseLayers_v4, overlays_v4).addTo(map2);

// geoJSON methods
// color scale according to total incidents
function getColor(d) {
	return d > 7 ? '#800026' :
		d > 6	? '#BD0026' :
		d > 5	? '#E31A1C' :
		d > 4	? '#FC4E2A' :
		d > 3	? '#FD8D3C' :
		d > 2	? '#FEB24C' :
		d > 1	? '#FED976' :
				'#FFEDA0';
}	

function getColorKnn(d) {
	if (d == 'ied explosion') {
		return "#0000FF"; // blue
	} else if (d == 'direct fire') {
		return "#FFFF00"; // yellow
	} else if (d == 'escalation of force') {
		return "#FF0000"; // red
	} else if (d == 'indirect fire') {
		return "#00FF00"; // green
	} else {
		return "#FFFFFF"; // white
	}
}	

function style(feature) {
	// search through array, find province from geojson (multiple) and sum the total count
	var count = 0;
	var search = $.grep(el_rows, function(e){ return e.province == feature.properties.province; });
	if (search != null) {
		for (var v in search) {
			for (var key in search[v]) {
				if (key == 'total') {
					count += parseInt(search[v][key]);
				}
			}				
		}			
	}
	feature.properties.total = count;
	return {			
		fillColor: getColor(cScale(count)),
		weight: 2,
		opacity: 1,
		color: 'white',
		dashArray: '3',
		fillOpacity: 0.7
	};
}

/* definitions for mouse interactions */
function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 5,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);
	
	// this is for putting d3 elements to the front
	var sel = d3.select("div#map2 .knn");
	sel.moveToFront();
	var sel = d3.select("div#map2 .districts");
	sel.moveToFront();
}

function resetHighlight(e) {
	geojson_layer.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map2.fitBounds(e.target.getBounds());
}

// function adds marker on click, if district needs to be checked
var layerGroupDistr = new L.FeatureGroup();
layerGroupDistr.addTo(map2);
function markDistrict(e) {
	var popup = L.popup();
	var content = "District " + e.district + " is at: <b>" + e.LatLng.toString() + "</b>";
	var marker = new L.Marker(e.LatLng).bindPopup(content);
	layerGroupDistr.addLayer(marker);
	marker.openPopup();
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		click: zoomToFeature
	});
}

// control that shows state info on hover
var info = L.control();

info.onAdd = function (map) {
	this._div = L.DomUtil.create('div', 'info');
	this.update();
	return this._div;
};

info.update = function (props) {
	this._div.innerHTML = '<h4><b>Province Information</b></h4>' +  (props ?
		'<b>' + props.province + '</b><br /> area: ' + props.area_sqkm + ' km<sup>2</sup><br /> ' +
		'reported incidents: <b>' + props.total + '</b>'
		: 'Hover over a province or click to zoom.<br />');
};

info.addTo(map2);

// get JSON file
var json_afg = (function () {
    var json = null;
    $.ajax({
        'async': false,
        'global': false,
        'url': "data/json/afg.geojson",
        'dataType': "json",
        'success': function (data) {
            json = data;
        }
    });
    return json;
})();

// this adds the CSV info and geoJson to the map
d3.csv("data/csv/v4/election.csv", function(error, data) {
	if (error) throw error;
	
	// Add a LatLng object to each item in the dataset
	data.forEach(function(d) {
		d.LatLng = new L.LatLng(d.lat, d.lon)
	});
	
    el_rows = data;
	
	/* Leaflet overlay pane */
	// scale function for the colors
	cScale = d3.scale.linear()
					.domain([0, d3.max(data, function(d) { return parseInt(d.total); })])
					.range([0, 7]);

	geojson_layer.addData(json_afg);
	geojson_layer.addTo(map2)
	
	/* Legend geoJSON */
	var legend = L.control({position: 'bottomright'});

	legend.onAdd = function(map) {
		var div = L.DomUtil.create('div', 'info legend'),
			grades = ['< 150', '< 350', '< 550', '< 650', '< 750', '< 1200', '1200+'],
			labels = [],
			from, val;

		for (var i = 0; i < grades.length; i++) {
			from = i;
			val = grades[i];

			labels.push(
				'<i style="background:' + getColor(from + 1) + '"></i> ' + grades[i]);
		}
		div.innerHTML = labels.join('<br>');
		return div;
	};
	
	
	/* Legend KNN */
	var legend_knn = L.control({position: 'bottomleft'});

	legend_knn.onAdd = function(map) {
		var div = L.DomUtil.create('div', 'info legend knn'),
			grades = ['IED Explosion', 'Direct Fire', 'Escalation of Force', 'Indirect Fire'],
			labels = [];

		for (var i = 0; i < grades.length; i++) {
			labels.push(
				'<i style="background:' + getColorKnn(grades[i].toLowerCase()) + '"></i> ' + grades[i]);
		}
		div.innerHTML = labels.join('<br>');
		return div;
	};

	legend.addTo(map2);
	legend_knn.addTo(map2);
	
	// on map layer changes, hide or show the legend and move d3's to front
	map2.on('overlayadd', function (eventLayer) {
		if (knn_enabled) {
			var selk = d3.select("div#map2 .knn");
			selk.moveToFront();
		}
		if (distr_enabled) {
			var sel = d3.select("div#map2 .districts");
			sel.moveToFront();
		}
		// add legend
		if (eventLayer.name == "KNN") {
			if (!firstRun) {
				legend_knn.addTo(this);
			}
		} else if (eventLayer.name == "GeoJSON") {
			legend.addTo(this);
			info.addTo(this);
		}
	});
	map2.on('overlayremove', function(eventLayer) {
		if (knn_enabled) {
			var selk = d3.select("div#map2 .knn");
			selk.moveToFront();
		}
		if (distr_enabled) {
			var sel = d3.select("div#map2 .districts");
			sel.moveToFront();
		}
		// remove legend
		if (eventLayer.name == "KNN") {
			this.removeControl(legend_knn);
		} else if (eventLayer.name == "GeoJSON") {
			this.removeControl(legend);
			this.removeControl(info);
		}
	});
	
	/* d3 map overlayPane to have info geoJson */
	var	g_knn = d3.select(map2.getPanes().overlayPane).select("svg").append("g").attr("class", "leaflet-zoom-hide knn"),
		g_distr = d3.select(map2.getPanes().overlayPane).select("svg").append("g").attr("class", "leaflet-zoom-hide districts");
	
	var transform = d3.geo.transform({
			point: projectPoint
	}),
	path = d3.geo.path().projection(transform);
	
	/* add districts */		
	var feature_distr = g_distr.selectAll("circle")
	.data(el_rows)
	.enter().append("circle")
	.style("stroke", "black")
	.style("stroke-width", "1px")  
	.style("opacity", .45) 
	.style("fill", "red")
	.attr("r", 4)
	.on("click", function(d) {
		markDistrict(d);
     });
		
	$('div#map2 svg g circle').tipsy({
		gravity: 'w', 
		html: true, 
		title: function() {
		var d = this.__data__;
			return "District: " + d.district + "<br>" + 
			"Incidents: " + parseInt(d.total); 
		}
	});
	
	// Handle zoom of the map and repositioning of d3 overlay
	map2.on("viewreset", update_distr);
	update_distr();
	
	// Reposition the SVG to cover the features.
	function update_distr() {
		feature_distr.attr("transform", 
		function(d) { 
			return "translate("+ 
				map2.latLngToLayerPoint(d.LatLng).x +","+ 
				map2.latLngToLayerPoint(d.LatLng).y +")";
			}
		)
	}
	
	// Use Leaflet to implement a D3 geometric transformation.
	function projectPoint(x, y) {
		var point = map2.latLngToLayerPoint(new L.LatLng(y, x));
		this.stream.point(point.x, point.y);
	}
	
	/* add KNN */
	d3.json("data/json/knn.json", function(error, dat) {
		if (error) throw error;
		
		var dataK5 = [];
		var dataK10 = [];
		var dataK20 = [];
		// Add a LatLng object to each item in the dataset
		dat.forEach(function(d) {
			d.LatLng = new L.LatLng(d.lat, d.lon)
			// append respective values
			if (d.Prediction_k5 != null) {
				dataK5.push(d);
			} else if (d.Prediction_k10 != null) {
				dataK10.push(d);
			} else if (d.Prediction_k20 != null) {
				dataK20.push(d);
			} else {
				console.log("object not used: " + d)
			}
		});
		
		/* add knn groups */
		var feature_knn = g_knn.selectAll("circle")
			.data(dataK5)
			.enter().append("circle")
			.style("opacity", .3) 
			.style("fill", function(d) {
				return getColorKnn(d.Prediction_k5);
			})
			.attr("r", 1.5);
		
		// Handle zoom of the map and repositioning of d3 overlay
		map2.on("viewreset", update_knn);
		update_knn();
		
		// Reposition the SVG to cover the features.
		function update_knn() {
			feature_knn.attr("transform", 
			function(d) { 
				return "translate("+ 
					map2.latLngToLayerPoint(d.LatLng).x +","+ 
					map2.latLngToLayerPoint(d.LatLng).y +")";
				}
			)
		}
		
		// on select, update with new data
		d3.selectAll("#opts_map2")
			.on('change', function() {
				// decide which dataset to load and update
				var ID = d3.select(this).property('value');
				if (ID == "k5") {
					update_d_knn(dataK5, 'Prediction_k5');
				} else if (ID == "k10") {
					update_d_knn(dataK10, 'Prediction_k10')
				} else if (ID == "k20") {
					update_d_knn(dataK20, 'Prediction_k20')
				}
			})
		
		function update_d_knn(d_knn, color_string) {
			g_knn.selectAll("circle")
				.data(d_knn)
				.transition()
				.duration(300)
				.ease("linear")
				.style("opacity", .3) 
				.style("fill", function(d) {
					return getColorKnn(d[color_string]);
				})
				.attr("r", 1.5);
		}
	})
});


