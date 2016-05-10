//Instagram functions using erin's http://cooper-union-instagram-proxy.herokuapp.com/

var default_Interval = 3600; //1 hour = 60*60 seconds
var maxEpoch = 1362096000; //March 1st 2013

var usedTimeInterval = {};

var timeArrary = [3600, //1hour
                  21600, //6 hours
                  43200, //12 hours
                  86400, //24 hours
                  604800, //1 week
                  2419200, //1 month
                  31536000, //1 year
                  94608000, //3 years
                  0
                ];

var getCurrentEpoch = function(){ //getting current time in unix time
  var time = Math.round(new Date().getTime()/1000.0);
  return time;
};

function timeConverter(UNIX_timestamp){ //taken from http://stackoverflow.com/questions/847185/convert-a-unix-timestamp-to-time-in-javascript
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  //var hour = a.getHours();
  //var min = a.getMinutes();
  //var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' /*+ hour + ':' + min + ':' + sec */;
  return time;
}

var searchUsers = function(username, callback){ //returns user's ID number (can only acess photos with proper user ID)
  console.log("searching...")
  $.getJSON("http://cooper-union-instagram-proxy.herokuapp.com/search/user/"+username, function(response){
    callback(response);
  });
}


var getUserPhotos = function(id, callback){ //gets user's most recent photos from IG
  $.getJSON("http://cooper-union-instagram-proxy.herokuapp.com/user/"+id+"/recent", function(response){
    console.log("getting photos...");
    console.log(response);
    var userPhotos = [];
    for(var i=0; i<response.length; i++){
      if(((response[i].location) && (response[i].location.latitude) && (response[i].caption) && (response[i].caption.text)) !== null){
        var photoObj = {
          caption: response[i].caption.text,
          location: response[i].location,
          comments: response[i].comments.count,
          likes: response[i].likes.count,
          image: {low: response[i].images.low_resolution, std: response[i].images.standard_resolution},
          time: response[i].created_time,
          userid: id,
          username: response[0].user.username,
          link: response[i].link
        }
        userPhotos.push(photoObj);
      }
    }
    callback(userPhotos);
  });

}


var getNPhotos = function(photoObj, index, callback){ //retruns number of photos location search
  var halfInt = parseInt(timeArrary[index], 10)*0.5;
  var lat = photoObj.location.latitude;
  var lng = photoObj.location.longitude;
  var minTime = parseInt(photoObj.time, 10) - halfInt;
  usedTimeInterval.min = minTime;
  var maxTime = parseInt(photoObj.time, 10) + halfInt;
  usedTimeInterval.maxTime = maxTime;

  console.log(""+photoObj.time+": "+timeConverter(photoObj.time));
  console.log("Min: "+minTime+": "+timeConverter(minTime));
  console.log("Max: "+maxTime+": "+timeConverter(maxTime));
  console.log("halfInt: "+halfInt);
  console.log("timeArrayIndex: "+index);

  if(index>7){
    callback(-1);
  };

  $.getJSON("http://cooper-union-instagram-proxy.herokuapp.com/search/media?lat="+lat+"&lng="+lng+"&min_timestamp="+minTime+"&max_timestamp="+maxTime, function(response){
    if(response.length<3){
      console.log("recursion");
      getNPhotos(photoObj, index+1, function(num){
        callback()
      });
    }else{
      console.log("callback");
      callback(response);
    }
  });
}

function getStats(photoObj, nearbyPhotos){
  console.log("getting stats...")
  var photos = [];
  photos.push(photoObj);
  for(var i=0; i<nearbyPhotos.length; i++){
    if((nearbyPhotos[i].caption)&&(nearbyPhotos[i].caption.text) !== null){
      var photo = {
        caption: nearbyPhotos[i].caption.text,
        comments: nearbyPhotos[i].comments.count,
        likes: nearbyPhotos[i].likes.count,
        image: {low: nearbyPhotos[i].images.low_resolution, std: nearbyPhotos[i].images.standard_resolution},
        time: nearbyPhotos[i].created_time,
        username: nearbyPhotos[i].user.username,
        id: nearbyPhotos[i].user.id,
        link: nearbyPhotos[i].link
      }
      photos.push(photo);
    }
  }
  return(photos)
}

function sortNumber(a,b) {
    return a - b;
}

function organizeStats(photos){
  console.log("organizing stats...")
  var mostLiked = {username: undefined, count: 0};
  var likes = [];

  var mostComments = {username: undefined, count: 0};
  var comments = [];
  var weightedComments = [];

  var scores = [];
  var highScore = {username: undefined, score: 0};

  var winningImage = undefined;
  var winnersIndex = 0;
  var winnersCaption = "";
  var winnersUsername = "";
  var winnersTime;

  var usernames = [];

  for(var i=0; i<photos.length; i++){
    likes.push(photos[i].likes);
    comments.push(photos[i].comments);
    usernames.push(photos[i].username);
    if(photos[i].likes>mostLiked.count){
      mostLiked.count = photos[i].likes;
      mostLiked.username = photos[i].username;
    }
    if(photos[i].comments>mostComments.count){
      mostComments.count = photos[i].comments;
      mostComments.username = photos[i].username;
    }
    var weightedComment = photos[i].comments*10;
    var score = photos[i].likes+weightedComment;
    scores.push(score);
    if(score>highScore.score){
      highScore.username = photos[i].username;
      highScore.score = score;
      winningImage = photos[i].image;
      winnersIndex = i;
      winnersUsername = photos[i].username;
      winnersCaption = photos[i].caption;
      winnersTime = photos[i].time;
    }

  }

  var you = {
    username: photos[0].username,
    likes: photos[0].likes,
    commnents: photos[0].comments,
    score: scores[0]
  }

  var winner = {
    username: winnersUsername,
    score: highScore,
    image: winningImage,
    comment: comments[winnersIndex],
    likes: likes[winnersIndex],
    caption: winnersCaption,
    time: winnersTime
  }

  var most = {
    liked: mostLiked,
    commented: mostComments,
    score: highScore,
  }

  var stats = {
    you: you,
    winner: winner,
    most: most,
    all: {
      usernames: usernames,
      likes: likes,
      comments: comments,
    }
  }

  return stats;
}



// var getNearbyPhotos = function(photoObj, index, callback){ //finding nearby photos based on chosen photo
//   if(index>8||index<0||timeArrary[index]===0){
//     console.log("invalid index -or- index overflow");
//     return;
//   }
//   var halfInt = parseInt(timeArrary[index], 10)*0.5;
//   var lat = photoObj.location.latitude;
//   var lng = photoObj.location.longitude;
//   var minTime = parseInt(photoObj.time, 10) - halfInt;
//   var maxTime = parseInt(photoObj.time, 10) + halfInt;
//
//   getNumPhotos(photoObj, index, function(num){
//     if(num>=8){
//       $.getJSON("http://cooper-union-instagram-proxy.herokuapp.com/search/media?lat="+lat+"&lng="+lng+"&min_timestamp="+minTime+"&max_timestamp="+maxTime, function(response){
//         callback(response);
//       });
//     }
//     else{
//       getNearbyPhotos(photoObj, index+1, function(response){
//       });
//     }
//   });
// }
