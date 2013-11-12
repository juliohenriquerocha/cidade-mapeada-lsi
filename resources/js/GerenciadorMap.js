var map;

// O usuario so tera um marker ativo. Quando ele confirmar, o marker ficara fixo
// na posicao e, se ele tiver mais lances, outro marker sera plotado
var marker; 
var markers;
var markerPath = './resources/images/icons/marker.png';
var geocoder;

function initMap() {
	geocoder = new google.maps.Geocoder();
	map = new OpenLayers.Map("map",{
		controls: [
			new OpenLayers.Control.Navigation({
				dragPanOptions: { enableKinetic: true}
			}),
			new OpenLayers.Control.Attribution(),
			new OpenLayers.Control.PanZoom()
		],
		projection: "EPSG:4326"
	});
	
	gmap = new OpenLayers.Layer.Google(
        "Google Streets", // the default
        {numZoomLevels: 20, visibility: false}
    );

	//Controles
	map.addControl(new OpenLayers.Control.LayerSwitcher(
			{'div':OpenLayers.Util.getElement('layerSwitcher')
				}));
	
	map.addLayer(gmap);
	
	setCenterPoint();
	
}

function setCenterPoint() {

	var lat = -7.22;
	var lon = -35.88;
	var center = new OpenLayers.LonLat(lon, lat).transform(
			new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
	map.setCenter(center, 12);
}

function codeAddress() {
	var address = document.getElementById('inputCidade').value;

	geocoder.geocode({
		'address' : address
	}, function(results, status) {

		if (status == google.maps.GeocoderStatus.OK) {
			var lon = results[0].geometry.location.lng();
			var lat = results[0].geometry.location.lat();
			var lonlat = new OpenLayers.LonLat(lon, lat).transform(
					new OpenLayers.Projection("EPSG:4326"), map
							.getProjectionObject());
			map.setCenter(lonlat, 12);
		} else {
			alert('Impossível achar essa localidade: ' + status);
		}
	});
}
