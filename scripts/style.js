//style functions

function display_search(response){
  $("#search-container").removeClass("hide");
  $("#search-container").removeClass("photos");
  $("#search-container").addClass("users");

  for(var i=0; i<response.length; i++){
    $("#search-container").append(
      "<div class='search-result' title='"+response[i].username+"' id='"+i+"' onclick='javascript:getresultAttr(this)'>"+
        "<p>"+response[i].username+": "+response[i].full_name+"</p>"+
        "<img src='"+response[i].profile_picture+"' height='90px'/>"+
      "</div>"
    );
  }
}

function display_photos(photos){
  $("#search-container").removeClass("users");
  $("#search-container").addClass("photos");
  $(".search-result").remove();
  $("h1").remove();

  $("body").prepend("<h1 class='goBack'>"+photos[0].username+"</h1>");
  for(var i=0; i<photos.length; i++){
    var time = timeConverter(photos[i].time);
    $("#search-container").append(
      "<div class='valid-photo tobechosen' title='"+photos[0].userid+"' id='"+i+"' onclick='javascript:getphotoAttr(this)'>"+
        "<img src='"+photos[i].image.low.url+"' width='225px'/>"+
        "<p><strong>Likes: "+photos[i].likes+"</strong></p>"+
        "<div class='caption-wrapper'>"+
          "<p class='caption'>"+photos[i].caption+"</p>"+
        "</div>"+
        "<p>"+time+"</p>"+
      "</div>"
    );
  }
}

function isolateChosen(xmlID, xmlClass){
  $("#"+xmlID).removeClass(xmlClass);
  $("#"+xmlID).addClass("chosen");
  $("."+xmlClass).remove(); //wanted to make hide, but cant seem to click h1

  console.log("isolated?")
}

function goBack(){
  $(".tobechosen").removeClass("hide");
  $(".valid-photo").removeClass("hide");
  $("#map").addClass("hide");
  $(".search-container").addClass("photos");
  $(".search-container").removeClass("hide");
  $(".chosen").removeClass("chosen");
  $("#chart-container").addClass("hide");
  console.log("in function goback")
}

function display_nearby(photoObj, nearbyPhotos){
  var positions = createPositions(photoObj, nearbyPhotos);
  var mapOptions = createMapOp(photoObj, 15);
  $("#map").removeClass("hide");
  $(".valid-photo").remove();
  draw('map', mapOptions, positions);
  var photos = getStats(photoObj, nearbyPhotos);
  console.log(photos);
  var stats = organizeStats(photos);
  console.log(stats);
  displayStats(stats);
}

function uncontested(username){
  $("h1").remove();
  $("body").prepend("<h1>"+username+" is champion by default...</h1>");
}

function noneValid(username){
  $("h1").remove();
  $("body").prepend("<h1>"+username+" has no valid photos for comparison...</h1>");
}

function tuckSearchBar(){
  $(".search-bar").removeClass("search-center");
  $(".search-bar").addClass("tuck-search");
  $(".search-container").removeClass("users");
  $(".search-container").addClass("photos");
}

function centerSearchBar(){
  $(".search-bar").removeClass("tuck-search");
  $(".search-bar").addClass("search-center");
  $(".search-container").removeClass("photos");
  $(".search-container").addClass("users");
}

function removeAll(){
  $("h1").remove();
  $("#map").addClass("hide");
  $("#chart-container").addClass("hide");
  $(".search-result").remove();
  $(".valid-photo").remove();
  $(".tobechosen").remove();
  $(".chosen").remove();
  $("#crown").addClass("hide");
  $("#crown").removeClass("champion-you");
  $("#crown").removeClass("champion-other");
  $(".winningPhoto").remove();
}

function displayStats(stats){
  $("#chart-container").removeClass("hide");
  makeChart(stats);
  console.log("displaying...");
  displayWinner(stats);
}

function displayWinner(stats){
  console.log(stats);
  if(stats.winner.username === stats.you.username){
    $("h1").remove();
    $("body").prepend("<h1>CONGRATULATIONS, you're King of the Area</h1>");
    $("#crown").removeClass("hide");
    $("#crown").addClass("champion-you");
    $(".chosen").addClass("champion");
    $(".chosen").removeClass("chosen");

  }else{
    $("h1").remove();
    $("body").prepend("<h1><strong>"+stats.winner.username+"</strong> is the king of the area</h1>");
    $("#crown").removeClass("hide");

    var time = timeConverter(stats.winner.time);
    $("#search-container").append(
      "<div class='winningPhoto'>"+
        "<img src='"+stats.winner.image.low.url+"' width='225px'/>"+
        "<p><strong>Likes: "+stats.winner.likes+"</strong></p>"+
        "<div class='caption-wrapper'>"+
          "<p class='caption'>"+stats.winner.caption+"</p>"+
        "</div>"+
        "<p>"+time+"</p>"+
      "</div>"
    );
    $("#crown").addClass("champion-other");
  }
}

function makeChart(stats){ //highcharts bar graph
    $('#chart-container').highcharts({
        chart: {
            type: 'column'
        },
        title: {
            text: 'Grams That Happend Around Yours'
        },
        xAxis: {
            categories: stats.all.usernames
        },
        yAxis: [{
            min: 0,
            max: (stats.mostLiked),
            title: {
                text: 'Users'
            }
        }, {
            title: {
                text: 'Likes & Comments'
            },
            opposite: true
        }],
        legend: {
            shadow: false
        },
        tooltip: {
            shared: true
        },
        plotOptions: {
            column: {
                grouping: false,
                shadow: false,
                borderWidth: 0
            }
        },
        series: [{
            name: 'Likes',
            color: 'rgba(248,161,63,1)', //'rgba(165,170,217,1)',
            data: stats.all.likes,
            pointPadding: 0.3,
            pointPlacement: -0.2
        }, {
            name: 'Comments',
            color: 'rgba(186,60,61,.9)', //'rgba(126,86,134,.9)',
            data: stats.all.comments,
            pointPadding: 0.4,
            pointPlacement: -0.2
        }]
    });
}
