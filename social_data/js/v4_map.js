"use strict";

/*
* initial source: https://bost.ocks.org/mike/leaflet/
* choropleth: http://leafletjs.com/examples/choropleth.html
* this map uses leaflet for geoJSON
*/

// leaflet map tiles
L.mapbox.accessToken = 'pk.eyJ1IjoibXJrYWlrZXYiLCJhIjoiY2luZGF4NzA2MDA1Z3d6bHlwbWZ4YWI4YiJ9.5tLR_2fjmu95FYEaEAljYw';
var street_v4 = L.tileLayer('https://api.mapbox.com/v4/mapbox.streets/{z}/{x}/{y}.png?access_token=' + L.mapbox.accessToken, {
	attribution: '&copy; <a href="https://www.mapbox.com/map-feedback/">Mapbox</a> &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var map2 = L.map('map2', {
	center: [34, 66],
	zoom: 6,
	layers: [street_v4]
});

var terrain_v4 = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var googlesat_v4 = L.tileLayer('https://mt1.google.com/vt/lyrs=y&hl=en&x={x}&y={y}&z={z}', {
	attribution: "Map data &copy;2016 Google"
});

var cartodbAttribution_v4 = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';

var positron_v4 = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
	attribution: cartodbAttribution_v4
});

// control map layers
var baseLayers_v4 = {
	"Streets (Mapbox)": street_v4,
	"Streets (CartoDB)":positron_v4,
	"Terrain (OSM)": terrain_v4,
	"Satellite (Google)": googlesat_v4
};

// this is the CSV info of the voting areas
var el_rows;
// color scale for geoJSON
var cScale;

var d3LayerDist_v4 = L.Class.extend({
	initialize: function() {
		return;
	},
	onAdd: function() {
		d3.select("div#map2 .districts").style("display", "block");
	},
	onRemove: function() {
		d3.select("div#map2 .districts").style("display", "none");
	},
});
var d3LayerKnn_v4 = L.Class.extend({
	initialize: function() {
		return;
	},
	onAdd: function() {
		d3.select("div#map2 .knn").style("display", "block");
	},
	onRemove: function() {
		d3.select("div#map2 .knn").style("display", "none");
	},
});

var svgLayerDist_v4 = new d3LayerDist_v4();
var svgLayerKnn_v4 = new d3LayerKnn_v4();
// create empty layer
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
	d3.selection.prototype.moveToFront = function() {
		return this.each(function(){
			this.parentNode.appendChild(this);
		});
	};
	var sel = d3.select(".districts");
	sel.moveToFront();
	var sel = d3.select(".knn");
	sel.moveToFront();
}

function resetHighlight(e) {
	geojson_layer.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map2.fitBounds(e.target.getBounds());
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
		: 'Hover over a province');
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
	
	/* Legend */
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

	legend.addTo(map2);
	
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
	.style("opacity", .6) 
	.style("fill", "red")
	.attr("r", 4);
		
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
		
		// Add a LatLng object to each item in the dataset
		dat.forEach(function(d) {
			d.LatLng = new L.LatLng(d.lat, d.lon)
		});
		console.log(dat);
	});
});


