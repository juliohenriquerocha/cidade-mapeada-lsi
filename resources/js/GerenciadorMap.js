var map;

// O usuario so tera um marker ativo. Quando ele confirmar, o marker ficara fixo
// na posicao e, se ele tiver mais lances, outro marker sera plotado
var marker; 
var markers;
var markerPath = './resources/images/icons/marker.png';
var geoserverURL = "http://150.165.75.171:8081/geoserver/DadosAbertos/wms";
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
	
	var ubs = getLayer("ubs");
	var creas = getLayer("creas");
	var cras = getLayer("cras");
	var redeprivada = getLayer("redeprivada");
	var fundacentro = getLayer("fundacentro");
	var comunidadesTerapeuticas = getLayer("comunidadesTerapeuticas");
	
	var sine = getLayer("sine");
	var receitaFederal = getLayer("receitafederal");

	//Controles
	map.addControl(new OpenLayers.Control.LayerSwitcher(
			{'div':OpenLayers.Util.getElement('layerSwitcher')
				}));
	
	map.addLayer(gmap);
	map.addLayers([ubs, cras, creas, redeprivada, fundacentro, comunidadesTerapeuticas, sine, receitaFederal]);
	
	setCenterPoint();
}

function getLayer(layerName) {

	var layer = new OpenLayers.Layer.WMS(layerName, geoserverURL, {
		layers : 'DadosAbertos:' + layerName,
		transparent : true
	}, {
		tileOptions : {
			maxGetUrlLength : 2048
		},
		singleTile : true,
		ratio : 1,
		displayOutsideMaxExtent : true,
		visibility : false,
		yx : {
			'EPSG:4326' : true
		}
	});

	return layer;
}

function setCenterPoint() {
	var lat = -12.382928;
	var lon = -50.273437;
	var center = new OpenLayers.LonLat(lon, lat).transform(
			new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
	map.setCenter(center, 4);
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
			map.setCenter(lonlat, 14);
		} else {
			alert('Impossível achar essa localidade: ' + status);
		}
	});
}
