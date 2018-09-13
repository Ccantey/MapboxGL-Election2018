var activeTab = {
  selection:"USPRS",
  geography:"cty",
  name:"COUNTYNAME"
};
var zoomThreshold = 8;
var hoveredStateId =  null;

// var layersArray = ['2012results-cty','2012results-vtd','2012results-sen','2012results-hse','2012results-cng','2012results-cty-hover','2012results-vtd-hover','2012results-sen-hover','2012results-hse-hover','2012results-cng-hover']
var layersArray = []; // at 0.22.0 you can no longer have undefined layers in array - must push them dynamically
var geocoder = null;

var today = new Date();

var popLegendEl = document.getElementById('pop-legend');
var pctLegendEl = document.getElementById('pct-legend');

function initialize(){
	if ($( window ).width() < 620){
		$("#map").height('500px');
	} else{
		$("#map").height('800px');
	}
	
	southWest = new mapboxgl.LngLat( -104.7140625, 41.86956);
    northEast = new mapboxgl.LngLat( -84.202832, 50.1487464);
    bounds = new mapboxgl.LngLatBounds(southWest,northEast);

    // mapboxgl.accessToken = 'Your Mapbox access token';
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaWVsdDNubmEwMGU3czNtNDRyNjRpdTVqIn0.yFaW4Ty6VE3GHkrDvdbW6g';

	map = new mapboxgl.Map({
		container: 'map', // container id
		// style: 'mapbox://styles/mapbox/dark-v9',
		style: 'mapbox://styles/ccantey/ciqxtkg700003bqnleojbxy8t?optimize=true',
		center: [-93.6678,46.50],
		maxBounds:bounds,		
		zoom: 6,
		minZoom: 6
	});

    var nav = new mapboxgl.NavigationControl({position: 'top-right'}); // position is optional
    map.addControl(nav);

    // geocoder = new google.maps.Geocoder; //ccantey.dgxr9hbq
    geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken
    });
    window.geocoder = geocoder;

    //map.addControl(geocoder);

    map.on('load', function () {
    	// add vector source:
	    map.addSource('electionResults', {
	        type: 'vector',
	        url: 'mapbox://ccantey.3rf8lrxs'
	    });     

        var layers = [
            //name, minzoom, maxzoom, filter, paint fill-color, stops, paint fill-opacity, stops
	        [
		        'cty',                               //layers[0] = id
		        3,                                   //layers[1] = minzoom
		        zoomThreshold,                       //layers[2] = maxzoom
		        ['==', 'UNIT', 'cty'],               //layers[3] = filter
		        activeTab.selection+'WIN',           //layers[4] = fill-color property -- geojson.winner (add this property to geojson)
		        [['DFL', '#6582ac'],['R', '#cc7575'],['TIE', '#333'],['NOVOTE','gray']],  //layers[5] = fill-color stops -- ['dfl':blue, 'r':red,'i':yellow]
		        activeTab.selection+'TOTAL',         //layers[6] = fill-opacity property
		        [                                    //layers[7] = fill-opacity stops (based on MN population)
		            [0, 0.25],
		            [17000, 0.45],
		            [53000, 0.6],
		            [140000, 0.7],
		            [280000, 0.8],
		            [700000, .99]
		        ],                                     
		        'hsl(55, 11%, 96%)'                  //layers[8] = outline color
	        ], 

   	        ['vtd', zoomThreshold, 20, ['==', 'UNIT', 'vtd'], activeTab.selection+'WIN', [['DFL', '#6582ac'],['R', '#cc7575'],['TIE', '#333']], activeTab.selection+'PCT', [[0, 0.25],[50, 0.45],[55, 0.6],[60, 0.7],[100, .99]], '#b8bbbf'],
   	        ['vtd-hover', zoomThreshold, 20, ['all', ['==', 'UNIT', 'vtd'], ["==", "VTD", ""]], activeTab.selection+'WIN', [['DFL', 'orange'],['R', 'orange'],['TIE', 'orange'],['NOVOTE','orange']], activeTab.selection+'PCT', [[6000, .5]], 'white'],

            ['cty-hover', 
            3, 
            zoomThreshold, 
            ['all', ['==', 'UNIT', 'cty'], ["==", "COUNTYNAME", ""]], 
            activeTab.selection+'WIN', //breaking change at 0.33 used to be 'USPRSTOTAL',
            [['DFL', 'orange'],['R', 'orange'],['TIE', 'orange'],['NOVOTE','orange']], //breaking change at 0.33 used to be [[6000, 'orange']]
            activeTab.selection+'TOTAL', 
            [[6000, .5]], 
            'white']
	    ];      

        layers.forEach(addLayer);
	});//end map on load
} //end initialize

function changeData(activetab){
	// console.log(activeTab.geography);
    // var visibility = map.getLayoutProperty(activetab+'-lines', 'visibility');
	switch (activeTab.geography) {
	    case "cty": 
	        var opacity = [ [0, 0.25],[16837, 0.45],[53080, 0.6],[142556, 0.7],[280000, 0.8],[700000, .99] ];
	        var opacityField = activeTab.selection+'TOTAL';
	        map.setLayoutProperty('cty-lines', 'visibility', 'visible');
	        map.setLayoutProperty('cty-symbols', 'visibility', 'visible');
	        popLegendEl.style.display = 'block';
            pctLegendEl.style.display = 'none';
            $('#candidate-table').show();
            if (activeTab.selection == 'USPRS'){
            	$('.td-image').show();
            	$('#candidate1photo').attr('src',"img/hillary.jpg");
            	$('#candidate1').html('Hillary Clinton (DFL)');
		        $('#candidate1votes').html('1,363,745');
		        $('#candidate1percent').html('46.4% ');

		        $('#candidate2photo').attr('src',"img/trump.jpg");
            	$('#candidate2').html('Donald Trump (R)');
		        $('#candidate2votes').html('1,321,017');
		        $('#candidate2percent').html('45.0% ');
		        $('#totalvotes').html('2,938,405');
            } 
            else {
            	$('#candidate1photo').attr('src',"");
            	$('#candidate1').html('Amy Klobuchar (DFL)');
		        $('#candidate1votes').html('9,272,975');
		        $('#candidate1percent').html('62.5% ');

		        $('#candidate2photo').attr('src',"");
            	$('#candidate2').html('Kurt Bills (R)');
		        $('#candidate2votes').html('4,339,870');
		        $('#candidate2percent').html('30.5% ');
		        $('#totalvotes').html('14,216,035');
            }
	        break;
	    case "cng": 
	        $('#candidate-table').hide();
	        var opacity = [[0, 0.25],[50, 0.45],[55, 0.6],[60, 0.7],[100, .99]];
	        var opacityField = activeTab.selection+'PCT';
	        map.setLayoutProperty('cng-lines', 'visibility', 'visible');
	        map.setLayoutProperty('cng-symbols', 'visibility', 'visible');
	        popLegendEl.style.display = 'none';
            pctLegendEl.style.display = 'block';
	        break;
	    case "sen": 
	        $('#candidate-table').hide();
	        var opacity = [[0, 0.25],[50, 0.45],[55, 0.6],[60, 0.7],[100, .99]];
	        var opacityField = activeTab.selection+'PCT';
	        map.setLayoutProperty('sen-lines', 'visibility', 'visible');
	        map.setLayoutProperty('sen-symbols', 'visibility', 'visible');
	        popLegendEl.style.display = 'none';
            pctLegendEl.style.display = 'block';
	        break;
	    case "hse":
	        $('#candidate-table').hide(); 
	        var opacity = [[0, 0.25],[50, 0.45],[55, 0.6],[60, 0.7],[100, .99]];
	        var opacityField = activeTab.selection+'PCT';
	        map.setLayoutProperty('hse-lines', 'visibility', 'visible');
	        map.setLayoutProperty('hse-symbols', 'visibility', 'visible');
	        popLegendEl.style.display = 'none';
            pctLegendEl.style.display = 'block';
	        break;
	};

    map.setPaintProperty("2016results-vtd", 'fill-color', {"type":'categorical', 'property': activeTab.selection+'WIN', 'stops':[['DFL', '#6582ac'],['R', '#cc7575'],['TIE', '#333']]});  // selection = map.querySourceFeatures('2012results-cty-hover', {sourceLayer:'AllResults', filter: ['has','COUNTYNAME']})
    map.setPaintProperty("2016results-vtd", 'fill-opacity', {"type":'interval', 'property': activeTab.selection+'PCT', 'stops': [[0, 0.25],[50, 0.45],[55, 0.6],[60, 0.7],[100, .99]]});
	// showResults(activeTab, feature.properties);
	var layer = [
	    [activeTab.geography,          3, zoomThreshold, ['==', 'UNIT', activeTab.geography], activeTab.selection+'WIN', [['DFL', '#6582ac'],['R', '#cc7575'],['TIE', '#333']], opacityField, opacity, 'hsl(55, 11%, 96%)'],
        [activeTab.geography+'-hover', 3, zoomThreshold, ['all', ['==', 'UNIT', activeTab.geography], ["==", activeTab.name, ""]], 'USPRSTOTAL', [[6000, 'orange']], opacityField, [[6000, .75]], 'white']
    ];

	layer.forEach(addLayer)
}

//remove layersArray element per 0.22.0
function spliceArray(a){
	var index = layersArray.indexOf(a);    // <-- Not supported in <IE9
	if (index !== -1) {
	    layersArray.splice(index, 1);
	}
}

function addLayer(layer) {
             
	         map.addLayer({
		        "id": "2016results-"+ layer[0],
		        "type": "fill",
		        "source": "electionResults",
		        "source-layer": "Election2016preliminaryResult-6l55xh", //layer name in studio
		        "minzoom":layer[1],
		        'maxzoom': layer[2],
		        'filter': layer[3],
		        "layout": {},
		        "paint": {		        	
		            "fill-color": {
		            	"type":'categorical',
		            	"property": layer[4], //layers[4] = fill-color property -- geojson.winner (add this property to geojson)
		            	"stops": layer[5],    //layers[5] = fill-color stops -- ['dfl':blue, 'r':red,'i':yellow]
		            },
		            "fill-opacity": {
		            	// "type":'interval', //default is interval
		            	property: layer[6],
		            	stops: layer[7]
		            },
		            "fill-outline-color": layer[8]
		        }
	         }, 'waterway-label');
	         layersArray.push("2016results-"+ layer[0])
}; 

function showResults(activeTab, feature){
    // console.log(feature)
	var content = '';
	var header ='';
	var geography = '';
	var unit =''
	var data = {
		activeTab:activeTab.selection,
		geography:activeTab.geography
	};
	
	var winner = (feature) ? feature[activeTab.selection+'WIN'] : '';
    if (winner === 'TIE'){
        var percentage = feature[activeTab.selection+'DFL']*100/feature[activeTab.selection+'TOTAL'];
    } else {
    	var percentage = feature[activeTab.selection+winner]*100/feature[activeTab.selection+'TOTAL'];
    }
	
	var partyObject = { 'DFL':'Democratic-Farm-Labor', 'R':'Republican', 'WI':'Write-In', 'IP':'Independence', 'LIB':'Libertarian','GP':'Green Party','LMN':'Legalize Marijuana Now'};
    var partyArray = ['DFL','R','IP','LIB','GP','LMN','WI'];
    var selectionMap ={'USREP':'Congressional District','MNLEG':'MN House District','MNSEN':'MN Senate District','USPRS': 'County'}
	//var districtMap ={'USPRS',['County', countyname]};

	if (feature.PCTNAME.length > 0){
		header += "<h5>Precinct Results</h5>";
		geography = "<th>Voting Precint: </th><td>"+feature.PCTNAME+"</td>";
		unit = "Precinct";
		if (activeTab.selection == 'USPRS'){
			content += "<th>County: </th><td>"+feature.COUNTYNAME+"</td>";
		}else{
			content += "<th>"+selectionMap[activeTab.selection]+": </th><td>"+feature[activeTab.selection+'DIST']+"</td>";
		}
	} else{
		
		if (feature.COUNTYNAME.length > 0){
		    header += "<h5>County Results</h5>";
			geography = "<th>County: </th><td>"+feature.COUNTYNAME+"</td>";
			unit = "County";
		}
		else if (feature[activeTab.selection+'DIST'].length>0){
		   	header += "<h5>District Results</h5>";
		   	content += "<th>"+selectionMap[activeTab.selection]+": </th><td>"+feature[activeTab.selection+'DIST']+"</td>";
		}
	}    

	switch (activeTab.selection) {
    case "USPRS":
        $('.td-image').show();
        // $('#thirdwheel').show();
        content += "<tr>"+geography+"</tr>";
        content += "<tr><th>U.S. President: </th><td> At-large</td></tr>";
        content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
        content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
        for (var i=0;i<partyArray.length;i++){
    		if(feature[activeTab.selection+partyArray[i]] > 0){
    			content +="<tr><th>"+partyObject[partyArray[i]]+': </th><td>'+feature[activeTab.selection+partyArray[i]].toLocaleString()+"</td></tr>";
    		}    	
    	}

        content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";
        break;
    // case "USSEN":
    //     $('.td-image').hide();
    //     // $('#thirdwheel').hide();
    //     content += "<tr>"+geography+"</tr>";
    //     content += "<tr><th>U.S. Senate: </th><td> At-large</td></tr>";
    //     content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
    //     content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
		// for (var i=0;i<partyArray.length;i++){
  //   		if(feature[activeTab.selection+partyArray[i]] > 0){
  //   			content +="<tr><th>"+partyObject[partyArray[i]]+': </th><td>'+feature[activeTab.selection+partyArray[i]].toLocaleString()+"</td></tr>";
  //   		}    	
  //   	}

  //       content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";


    //     break;
    case "USREP":
        $('.td-image').hide();
        // $('#thirdwheel').hide();
        data['district'] = feature.CONGDIST;
        content += "<tr>"+geography+"</tr>";
        content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
        content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
		for (var i=0;i<partyArray.length;i++){
    		if(feature[activeTab.selection+partyArray[i]] > 0){
    			content +="<tr><th>"+partyObject[partyArray[i]]+': </th><td>'+feature[activeTab.selection+partyArray[i]].toLocaleString()+"</td></tr>";
    		}    	
    	}
        content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";
        break;
    case "MNSEN":
        $('.td-image').hide();
        // $('#thirdwheel').hide();
        data['district'] = feature.MNSENDIST;
        content += "<tr>"+geography+"</tr>";
        content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
        content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
		for (var i=0;i<partyArray.length;i++){
    		if(feature[activeTab.selection+partyArray[i]] > 0){
    			content +="<tr><th>"+partyObject[partyArray[i]]+': </th><td>'+feature[activeTab.selection+partyArray[i]].toLocaleString()+"</td></tr>";
    		}    	
    	}
        content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";
        break;
    case "MNLEG":
        $('.td-image').hide();
        // $('#thirdwheel').hide();
        data['district'] = feature.MNLEGDIST;

        if(feature[activeTab.selection+'DIST'] =='32B'){
        	content += "<tr><td>The Minnesota Supreme Court has determined that a vacancy in nomination exists for Legislative District 32B under Minnesota Statutes 204B.13 due to a candidate being ineligible to hold the office. The Governor has issued a Writ of Special Election which schedules the election for February 14, 2017.</td><tr>";
        } else {
        	content += "<tr>"+geography+"</tr>";
        	content += "<tr><th>"+unit+" Winner: </th><td class='winner-"+winner+"'>"+winner+" </td></tr>";
        	content += "<tr><th>Percentage: </th><td class='winner-"+winner+"'>"+percentage.toFixed(1)+"% </td></tr>";
			for (var i=0;i<partyArray.length;i++){
    			if(feature[activeTab.selection+partyArray[i]] > 0){
    				content +="<tr><th>"+partyObject[partyArray[i]]+': </th><td>'+feature[activeTab.selection+partyArray[i]].toLocaleString()+"</td></tr>";
    			}    	
    		}
        	content += "<tr><th>Total Votes: </th><td>"+feature[activeTab.selection+'TOTAL'].toLocaleString()+"</td></tr>";
        }
        break;
    }
    $('#candidate-table').show();
    // console.log(data);
    $.ajax("php/winners.php", {
		data: data,
		success: function(result){			
			showWinners(result.totals[0], feature);
		}, 
		error: function(){
			console.log('error');
		}
	});

	document.getElementById('precinct-header').innerHTML = header;
    document.getElementById('precinct-results').innerHTML = content;
    //  for some reason its only grabbing the last element in += content
	// $('#precinct-header').html(header);
 //    $('#precinct-results').html(content);
    $('#clear').show();
}

function showWinners(totals, feature){
	// console.log(totals)
	var sortedWinners = sortObjectProperties(totals);
    // var presidentMap={'dfl':'Hillary Clinton','republican':'Donald Trump', 'libertarian':'Gary Johnson', 'green':'Jill Stein'}
	for (var i = 0; i<sortedWinners.length; i++){
		var percent = sortedWinners[i][1]*100/sortedWinners[0][1]
		// console.log(percent.toFixed(1))
		if (i>0 && i<4){
			var party = sortedWinners[i][0].toUpperCase();
			var candidate = activeTab.selection + '' + party +'CN'; //ex: USPRSDFLCN
			// console.log(feature[candidate])
			if (activeTab.selection == 'USPRS'){
				// $('#candidate'+i).removeClass();
				// $('#candidate'+i).addClass('winner-'+party)
                $('#candidate'+i).html(feature[candidate]+' ('+party+')');
		        $('#candidate'+i+'votes').html(sortedWinners[i][1].toLocaleString());
		        $('#candidate'+i+'percent').html(percent.toFixed(1)+'% ');
			} else {
				// $('#candidate'+i).removeClass();
				// $('#candidate'+i).addClass('winner-'+party)
				$('#candidate'+i).html(feature[candidate]+' ('+party+')');
		        $('#candidate'+i+'votes').html(sortedWinners[i][1].toLocaleString());
		        $('#candidate'+i+'percent').html(percent.toFixed(1)+'% ');
			}

	    } else{
	    	document.getElementById('totalvotes').innerHTML = sortedWinners[0][1].toLocaleString();
	    }
	}
}

function sortObjectProperties(obj){
    // convert object into array
    var sortable=[];
    for(var key in obj)
        if(obj.hasOwnProperty(key))
            sortable.push([key, obj[key]]); // each item is an array in format [key, value]
    // sort items by value
    sortable.sort(function(a, b)
    {
      return b[1]-a[1]; // compare numbers
    });
    return sortable; // array in format [ [ key1, val1 ], [ key2, val2 ], ... ]
}

function mapResults(feature){
	// console.log(feature.layer.id)
	switch (feature.layer.id) {
	    case "2016results-vtd":
	        map.setFilter("2016results-vtd", ['all', ['==', 'UNIT', 'vtd'], ["!=", "VTD",feature.properties.VTD]]);
            map.setFilter("2016results-vtd-hover", ['all', ['==', 'UNIT', 'vtd'], ["==", "VTD",feature.properties.VTD]]);
	        break;
	    case "2016results-vtd-hover":
	        break;
	    default:
	    	// console.log("2016results-"+activeTab.geography+"-hover", ['all', ['==', 'UNIT', activeTab.geography], ["==", activeTab.name, feature.properties[activeTab.name]]]);
	        map.setFilter("2016results-"+activeTab.geography, ['all', ['==', 'UNIT', activeTab.geography], ["!=", activeTab.name, feature.properties[activeTab.name]]]);
            map.setFilter("2016results-"+activeTab.geography+"-hover", ['all', ['==', 'UNIT', activeTab.geography], ["==", activeTab.name, feature.properties[activeTab.name]]]);
    }
}

//submit search text box - removed button for formatting space
function keypressInBox(e) {
    var code = (e.keyCode ? e.keyCode : e.which); //ternary operator-> condition ? expr1 : expr2 -> If condition is true, then expression should be evaluated else evaluate expression 2
    if (code == 13) { //Enter keycode                        
        e.preventDefault();
        geoCodeAddress(geocoder);
    };
}

function geoCodeAddress(geocoder) {
    var address = document.getElementById('address').value;

    // anatomy of Mapbox GL Geocoder
    // https://api.mapbox.com/geocoding/v5/mapbox.places/1414%20skyline%20rd%2C%20eagan.json?country=us&proximity=38.8977%2C%2077.0365&bbox=-104.7140625%2C%2041.86956%2C-84.202832%2C%2050.1487464&types=address%2Clocality%2Cplace&autocomplete=true&access_token=pk.eyJ1IjoiY2NhbnRleSIsImEiOiJjaWVsdDNubmEwMGU3czNtNDRyNjRpdTVqIn0.yFaW4Ty6VE3GHkrDvdbW6g 
    var geocoderURL  = 'https://api.tiles.mapbox.com/v4/geocode/mapbox.places/';
        geocoderURL += address + '.json?access_token=' + mapboxgl.accessToken;

    //$.ajax vs mapbox.util.getJSON
    //mapboxgl.util.getJSON(geocoderURL, function(err, result) {/*do stuff with result*/ });

	$.ajax({
	  type: 'GET',
	  url: geocoderURL,
	  success: function(result) {
	  	    //mapbox-gl geocoder returns results in order from closest match to least closest, so grab [0]
	          var topResult = result.features[0];              
		      map.flyTo({
		      	center:topResult.geometry.coordinates,
		      	zoom:12,
		      	speed:1.75
		      });
		      addMarker(topResult.geometry);
	  },
	  error: function() {
	       alert('geocode fail'); //maybe pass to google
	  }
	});


	    return false;
}

function addMarker(e){
   removeLayers('pushpin');

   map.once('zoomend', function(){
       //project latlong to screen pixels for qRF()
       var center = map.project([e.coordinates[0],e.coordinates[1]])      
       var features = map.queryRenderedFeatures(center,{ layers: ["2016results-vtd"] }); //queryRenderedFeatures returns an array
       var feature = (features.length) ? features[0] : '';
       showResults(activeTab, feature.properties);
       mapResults(feature);
   });

   	//add marker
	map.addSource("pointclick", {
  		"type": "geojson",
  		"data": {
    		"type": "Feature",
    		"geometry": {
      			"type": "Point",
      			"coordinates": e.coordinates
    		},
    		"properties": {
      			"title": "mouseclick",
      			"marker-symbol": "myMarker-Blue-Shadow"
    		}
  		}
	});

    map.addLayer({
        "id": "pointclick",
        type: 'symbol',
        source: 'pointclick',
        "layout": {
        	"icon-image": "{marker-symbol}",
        	"icon-size":1,
        	"icon-offset": [0, -13]
        },
        "paint": {}
    });
}

function removeLayers(c){

	switch (c){
		case'all':
		map.setFilter("2016results-vtd", ['all', ['==', 'UNIT', 'vtd'], ["!=", "VTD",'any']]);
        map.setFilter("2016results-vtd-hover", ['all', ['==', 'UNIT', 'vtd'], ["==", "VTD",'all']]);
        // map.setFilter("2012results-cty", ['all', ['==', 'UNIT', 'cty'], ["!=", "cty",'any']]);
        // map.setFilter("2012results-cty-hover", ['all', ['==', 'UNIT', 'cty'], ["==", "cty",'all']]);

        map.setFilter("2016results-"+activeTab.geography, ['all', ['==', 'UNIT', activeTab.geography], ["!=", activeTab.name, 'all']]);
        map.setFilter("2016results-"+activeTab.geography+"-hover", ['all', ['==', 'UNIT', activeTab.geography], ["==", activeTab.name, 'all']]);

        $('#precinct-header').html("");
        $('#precinct-results').html("");
        $('#clear').hide();

        if(activeTab.selection == 'USPRS' || activeTab.selection == 'USSEN'){
        	$('#candidate-table').show();
        } else{
        	$('#candidate-table').hide();
        }
		//remove old pushpin and previous selected district layers 
		if (typeof map.getSource('pointclick') !== "undefined" ){ 
			// console.log('remove previous marker');
			map.removeLayer('pointclick');		
			map.removeSource('pointclick');
		}		
		break;		
		case 'pushpin':
		//remove old pushpin and previous selected district layers 
		if (typeof map.getSource('pointclick') !== "undefined" ){ 
			// console.log('remove previous marker');
			map.removeLayer('pointclick');		
			map.removeSource('pointclick');
		}
		break;
	}    
}
