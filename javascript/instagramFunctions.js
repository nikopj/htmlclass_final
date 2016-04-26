//Instagram functions using erin's http://cooper-union-instagram-proxy.herokuapp.com/

var defaultInt = 3600 //1 hour = 60*60 seconds
var maxEpoch = 1362096000 //March 1st 2013

var getCurrentEpoch = function(){
  var time = Math.round(new Date().getTime()/1000.0);
  return time;
}

var getUserID = function(username){
  var search = username;
  var IDnum;

  $.getJSON("http://cooper-union-instagram-proxy.herokuapp.com/search/user/"+"search", function(response){
    IDnum = response[0].id;
  });

  return IDnum;
};

var getUserPhotos = function(username){
  var id = null;
  var id = getUserID(username);
  var userPhotos = [];

  if(id != null){
    $.getJSON("http://cooper-union-instagram-proxy.herokuapp.com/user/"+id+"/recent", function(response){
      for(var i=0; i<response.length; i++){
        if((response[i].location) && (response[i].location.latitude !== null)){
          var photoObj = {
            caption: response[i].caption.text,
            location: response[i].location,
            likes: response[i].likes.count,
            image: response[i].images.standard_resolution,
            time: response[i].created_time
          };
          userPhotos.push(photoObj);
        };
      };
    });
  };

  return userPhotos;
};

var getNumPhotos = function(photoObj, timeInterval){
  var halfInt = timeInterval*0.5;
  var lat = photoObj.location.latitude;
  var lng = photoObj.location.longitude;
  var minTime = photoObj.time - halfInt;
  var maxTime = photoObj.time + halfInt;
  var numPhotos;

  if(maxTime > maxEpoch){
    return -1;
  }

  $.getJSON("http://cooper-union-instagram-proxy.herokuapp.com/search/media?lat="+lat"&lng="+lng+"&min_timestamp="+minTime+"&max_timestamp="+maxTime, function(response){
    num = response.length;
  });

  return numPhotos;
}

var getNearbyPhotos = function(photoObj){
  var timeInterval = defaultInt;
  var greatestNumPhotos = 0;
  var greatestTimeInt = null;

  while((timeInterval<maxEpoch)&&(greatestNumPhotos<10)){ //finding greatest number of photos by varying time interval

    var numPhotos = getNumPhotos(photoObj, timeInterval);
    if(numPhotos>greatestNumPhotos){
      greatestNumPhotos = numPhotos;
    }

    if(timeInterval === defaultInt){
      timeInterval = (60*60*24);
    }
    if(timeInterval)
    //MAKE AN ARRAY OF TIME INTERVALS, DO WHILE LOOP IN i CYCLE THROUGH INTERVALS

  }
}
