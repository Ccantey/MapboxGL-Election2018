$( document ).ready(function() {
	//kickoff map logic
  console.info("Welcome to the MN legislative elections application, developed by the MN State Legislative Coordinating Commission. The application's Mapbox-GL and responsive web design(RWD), open-source code can be found at 'https://github.com/Ccantey/LCC-Elections'.");

  // document.getElementById("spanDate").innerHTML = today.getMonth()+1 + "/" + today.getDate()+ "/" + today.getFullYear();
  
  initialize();
  $('#clear').hide();
  // removed for 2018
  // $('.mapboxgl-ctrl-top-right, #legend').affix({
  //   offset: {
  //   top: 210
  //   }
  // });

  //mousemove is too slow
  map.on('click', function (e) {
    // console.log(e.point)
    var features = map.queryRenderedFeatures(e.point,{ layers: layersArray }); //queryRenderedFeatures returns an array
    // var feature = features[0];
    var feature = (features.length) ? features[0] : '';
    // console.log(feature.properties);
    removeLayers('pushpin');
    mapResults(feature);
    showResults(activeTab, feature.properties);
       
  });

  //show pointer cursor
  map.on('mousemove', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: layersArray });
    map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';

  });
  
  map.on("mousemove", "2016results-cty", function(e) {
    console.log(e.features.length)
      if (e.features.length > 0) {
            if (hoveredStateId) {
                map.setFeatureState({source: 'electionResults', sourceLayer:'Election2016preliminaryResult-6l55xh', id: hoveredStateId}, { hover: false});
            }
            hoveredStateId = e.features[0].id;
            map.setFeatureState({source: 'electionResults', sourceLayer:'Election2016preliminaryResult-6l55xh', id: hoveredStateId}, { hover: true});
        }
  });

  map.on("mouseleave", "2016results-cty", function() {
    if (hoveredStateId) {
        map.setFeatureState({source: 'electionResults', sourceLayer:'Election2016preliminaryResult-6l55xh', id: hoveredStateId}, { hover: false});
    }
    hoveredStateId =  null;
  });


  //show grab cursor
  map.on('dragstart', function (e) {
    var features = map.queryRenderedFeatures(e.point, { layers: layersArray });
    map.getCanvas().style.cursor = (features.length) ? 'grab' : '';
  });

  map.on('zoom', function() {
    if( activeTab.geography == 'cty' ){
      if (map.getZoom() > zoomThreshold) {
          popLegendEl.style.display = 'none';
          pctLegendEl.style.display = 'block';
      } else {
          popLegendEl.style.display = 'block';
          pctLegendEl.style.display = 'none';
      }
    }
  });

  $('#search').click(function(e){
    e.preventDefault();
    geoCodeAddress(geocoder);
  });

  // enter key event
  $("#address").bind("keypress", {},  keypressInBox);

  $('#home').on('click', function(){
   	window.open("http://www.gis.leg.mn")
  });

  $('#clear').on('click', function(){
    removeLayers('all');

  })

  $('.election-navigation-a').on('click', function(e){
   	e.preventDefault();
    //remove previous layers
    $('#clear').hide();
    document.getElementById('precinct-header').innerHTML = "";
    document.getElementById('precinct-results').innerHTML = "";
    map.removeLayer("2016results-"+ activeTab.geography);
    map.removeLayer("2016results-"+ activeTab.geography+"-hover");
    spliceArray("2016results-"+ activeTab.geography);
    spliceArray("2016results-"+ activeTab.geography+"-hover");
    map.setLayoutProperty(activeTab.geography + '-symbols', 'visibility', 'none');
    map.setLayoutProperty(activeTab.geography + '-lines', 'visibility', 'none');
    //remove any vtd selection
    map.setFilter("2016results-vtd", ['all', ['==', 'UNIT', 'vtd'], ["!=", "VTD",'any']]);
    map.setFilter("2016results-vtd-hover", ['all', ['==', 'UNIT', 'vtd'], ["==", "VTD",'all']]);

    $('.election-navigation-a').removeClass('active');
      
    //add new selections
    $(this).addClass('active');
    activeTab.selection = $(this).data('district');
    activeTab.geography = $(this).data('geography');
    activeTab.name = $(this).data('name');
    changeData(activeTab);
  });

  document.getElementById('shareBtn').onclick = function() {
    FB.ui({
      method: 'share',
      display: 'popup',
      href: 'http://gis.leg.mn/iMaps/elections/2016/all/',
    }, function(response){});
  };


});//end ready()



