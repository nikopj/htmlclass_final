//Google maps api functions

var draw = function(id, mapOptions, positions) {

  var map = new google.maps.Map(document.getElementById(id),
      mapOptions);

  var myLatlng = new google.maps.LatLng(40.7293, -73.9906);

  //set up some empty arrays to use
  var markers = [];
  var infoWindows = [];
  var popUps = [];

  //create all of the markers on the map
  for (i in positions) {

    // To add the marker to the map, use the 'map' property
    markers[i] = new google.maps.Marker({
        position: positions[i].map,
        map: map,
        title:"The location of the " + positions[i].title
        // icon: 'http://placehold.it/24x50' //url to images
    });

  }

  //loop through the markers, and add pop-up windows to them
  for (i in markers) {

    //create a template with two placeholder to replace
    var popUpTemplate = '<div class="content"><a href="{{link}}">{{content}}</a></div>';

    //replace the content placeholder
    popUps[i] = popUpTemplate.replace('{{content}}', positions[i].title);

    //replace the link placeholder
    popUps[i] = popUps[i].replace('{{link}}', positions[i].link);

    //create a new info window
    infoWindows[i] = new google.maps.InfoWindow({
      //the contents is the string-replaced template we created within this loop
      content:popUps[i]
    });

    //when a marker is clicked on
    google.maps.event.addListener(markers[i], 'click', function(innerKey) {
      return function() {
          //comment out the for loop persist each info window
          for (j in markers) {
            infoWindows[j].close(map, markers[j]);
          }

          //open the infoWindow related to the marker clicked on
          infoWindows[innerKey].open(map, markers[innerKey]);
      }
    }(i));
  }
}

function createPositions(initial, response){ //creating positions to be read by google maps
  var positions = [];
  var initial_pos = {
      "title": initial.caption,
      "map": new google.maps.LatLng(initial.location.latitude, initial.location.longitude),
      "link": initial.link,
      "html": "<img src='"+initial.image.std.url+"' width='320px' />"
    };
  positions.push(initial_pos);
  for(var i=0; i<response.length; i++){
    var pos = {
        "title": response[i].user.username,
        "map": new google.maps.LatLng(response[i].location.latitude,response[i].location.longitude),
        "link": response[i].link,
        "html": "<img src='"+response[i].images.standard_resolution.url+"' width='320px' />"
    };
    positions.push(pos);
  }
  return positions;
}

function createMapOp(initial, zoom){
  var mapOptions = {
             zoom: zoom,
             center: new google.maps.LatLng(initial.location.latitude, initial.location.longitude)
           };
  return mapOptions;
}
