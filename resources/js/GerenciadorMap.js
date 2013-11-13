var map;

// O usuario so tera um marker ativo. Quando ele confirmar, o marker ficara fixo
// na posicao e, se ele tiver mais lances, outro marker sera plotado
var marker; 
var markers;
var markerPath = './resources/images/icons/marker.png';
var geoserverURL = "http://150.165.75.171:8081/geoserver/DadosAbertos/wms";
var geocoder = new google.maps.Geocoder();
var info;
var currentInfoLayer, currentInfoName;
OpenLayers.ProxyHost = "./resources/cgi-bin/proxy.cgi?url=";

function initMap() {
	map = new OpenLayers.Map("map",{
		controls: [
			new OpenLayers.Control.Navigation({
				dragPanOptions: { enableKinetic: true}
			}),
			new OpenLayers.Control.Attribution(),
			new OpenLayers.Control.PanZoom()
		]
	});
	
	gmap = new OpenLayers.Layer.Google(
        "Google Streets", // the default
        {numZoomLevels: 20, visibility: false}
    );
	
	var ubs = getLayer("ubs", "Unidades Básicas de Saúde", "resources/images/ubsIcon.png");
	var creas = getLayer("creas", "CREAS", "resources/images/creasIcon.png");
	var cras = getLayer("cras", "CRAS", "resources/images/crasIcon.png");
	var redeprivada = getLayer("redeprivada", "Rede Privada de Assistência Social", "resources/images/assistenciaSocialIcon.png");
	var fundacentro = getLayer("fundacentro", "Estruturas de Fundacentro", "resources/images/fundacentroIcon.png");
	var comunidadesTerapeuticas = getLayer("comunidadesTerapeuticas", "Comunidades Terapeuticas", "resources/images/comunidadeTerapeuticaIcon.png");
	var cartorio = getLayer("cartorio", "Cartório", "resources/images/cartorioIcon.png");
	var sine = getLayer("sine", "Sistema Nacional de Empregos", "resources/images/sineIcon.png");
	var receitaFederal = getLayer("receitafederal", "Unidades de Atendimento da Receita Federal", "resources/images/receitaFederalIcon.png");

	//Controles
	map.addControl(new OpenLayers.Control.LayerSwitcher(
			{'div':OpenLayers.Util.getElement('layerSwitcher')
				}));
	
	map.addLayer(gmap);
	map.addLayers([ubs, cras, creas, redeprivada, fundacentro, comunidadesTerapeuticas, cartorio, sine, receitaFederal]);
	
	setCenterPoint();
	
	info = new OpenLayers.Control.WMSGetFeatureInfo({
		url : geoserverURL,
		title : 'InfoBox',
		queryVisible : true,
		maxFeatures : 1,
		infoFormat : 'application/vnd.ogc.gml',
		eventListeners : {
			getfeatureinfo : function(event) {
				var features = this.format.read(event.text);
				if(features.length == 0) return;
				currentInfoLayer = features[0].gml.featureType;
				var mensagem = createDataTableInformation(features[0].data);
				openInformation(mensagem);
			}
		}
	});
	map.addControl(info);
	info.activate();
}

function getLayer(layerName, name, icon) {
	var metadata = new Array();
	metadata["icon"] = icon;
	var layer = new OpenLayers.Layer.WMS(name, geoserverURL, {
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
		metadata: metadata,
		yx : {
			'EPSG:4326' : true
		}
	});

	return layer;
}

function setCenterPoint() {
	var lat = getUrlVars()["lat"];
	var lng = getUrlVars()["lng"];
	
	if(lat == null || lng == null){
		lat = -12.382928;
		lon = -50.273437;
		var center = new OpenLayers.LonLat(lon, lat).transform(
				new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
		map.setCenter(center, 4);
	}else{
		var center = new OpenLayers.LonLat(lng, lat).transform(
				new OpenLayers.Projection("EPSG:4326"), map.getProjectionObject());
		map.setCenter(center, 14);
	}
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
			alert('Imposs�vel achar essa localidade: ' + status);
		}
	});
}

function codeAddressIndex() {
	
	var address = document.getElementById('inputCidadeInicial').value;

	geocoder.geocode({
		'address' : address
	}, function(results, status) {

		if (status == google.maps.GeocoderStatus.OK) {
			var lon = results[0].geometry.location.lng();
			var lat = results[0].geometry.location.lat();
			
			var newUrl = window.location.href.substring(0, window.location.href.length-10) + "mapa.html?lat="+lat + "&lng="+lon;
			window.location.href = newUrl;
			
		} else {
			alert('Impossível achar essa localidade: ' + status);
		}
	});
}

function getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function formatInfomation(features) {
	var html = '<table class="table table-striped table-condensed">';
	if (features && features.length) {
		for ( var i = 0, len = features.length; i < len; i++) {
			var feature = features[i];
			var attributes = feature.attributes;
			for ( var k in attributes) {
				html += '<tr><th align="left">' + k.replace(/_/gi, ' ')
						+ '</th><td>' + attributes[k] + '</td></tr>';

			}

		}
	}
	return html += '</table>';
}

function createDataTableInformation(data){
	var div = document.createElement("div");
	var table = document.createElement("table");
	var thead = document.createElement("thead");
	var trTHead = document.createElement("tr");
	var thField = document.createElement("th");
	thField.innerHTML = "Campo";
	var thValue = document.createElement("th");
	thValue.innerHTML = "Valor";
	
	trTHead.appendChild(thField);
	trTHead.appendChild(thValue);
	
	thead.appendChild(trTHead);
	
	table.appendChild(thead);
	
	table.setAttribute("class", "table table-hover");
	for (var key in data){
		var tr = document.createElement("tr");
		
		var value = data[key];
		
		var tdField = document.createElement("td");
		var tdValue = document.createElement("td");
		
		tdField.innerHTML = key + ": ";
		tdValue.innerHTML = value;
		
		tr.appendChild(tdField);
		tr.appendChild(tdValue);
		
		table.appendChild(tr);
	}
	div.appendChild(table);
	return div.innerHTML;
}

function openInformation(mensagem){
	bootbox.dialog({
		  message: mensagem,
		  title: "Informação",
		  buttons: {
			    success: {
			      label: "Twitter",
			      className: "btn-twitter",
			      callback: function() {
			        twitterShare();
			      }
			    },
			    danger: {
			      label: "Facebook",
			      className: "btn-primary",
			      callback: function() {
			        facebookShare();
			      }
			    },
			    main: {
			      label: "Fechar",
			      className: "btn-danger"
			    }
			  }
		});
}

var pathname = location.href;

function facebookShare(){
	//alert("Facebook - Camada: " + currentInfoLayer);
	var fb = "http://www.facebook.com/sharer.php?u=" + pathname;
	window.open(fb);
}

function twitterShare(){
	//alert("Twitter - Camada: " + currentInfoLayer);
	var t = "http://twitter.com/share?url=" + pathname;
	window.open(t);
}

