var defaults = {
  memberId: '',
  mapId: '',
  textId: '',
  top5Id: '',
  member: ''
};

function showMemories(options, callback) {
  var config = _.extend(defaults, options);

  var madridLatLng = new google.maps.LatLng(40.4378271, -3.6795367);
  var map = initMap(config.mapId, madridLatLng);

  qccaTravels(map, function(map, visits, nicknames) {
    var member = options.member;
    var visits = member === '' ? visits : _.filter(visits, function(visit) {
      return visit.who === member;
    });
    displayMembers(document.getElementById(config.memberId), visits);
    displayVisits(map, visits);
    loadStories(visits, nicknames, document.getElementById(config.textId));
    loadTop(visits, document.getElementById(config.top5Id), 5);
    callback();
  });
  //cartoDbTravels();
}

function initMap(mapId, latlng) {
  var mapOptions = {
    center: latlng,
    zoom: 2,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  return new google.maps.Map(document.getElementById(mapId), mapOptions);
}

function displayMembers(select, visits) {
  if(select.options.length > 0) {
    return;
  }
  function createOption(text, value) {
    var option = document.createElement('option');
    option.value = text;
    option.innerText = value;
    return option;
  }

  select.appendChild(createOption('', ''));
  var members =  _.uniq(_.map(visits, function(visit) { return visit.who; })).sort();
  _.map(members, function(member) {
    select.appendChild(createOption(member,member));
  });
}

function displayVisits(map, visits) {
  for(var v = 0; v < visits.length; v++) {
    var visit = visits[v];

    var contentString = '<div id="content">'+visit.who+'</div>';

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });

    var marker = new google.maps.Marker({
        position: new google.maps.LatLng(visit.lat, visit.lng),
        map: map,
        title: visit.where
    });
    google.maps.event.addListener(marker, 'click', function() {
      infowindow.open(map,marker);
    });
  }
}

function loadTop(visits, list, count) {
  var counts = _.countBy(visits, function(visit) {
    return visit.where;
  });
  var sortedCounts = _.sortBy(_.pairs(counts), function(count) {
    return count[1];
  }).reverse().slice(0, count);
  _.map(sortedCounts, function(sortedCount) {
    var item = document.createElement('li');
    item.innerText = sortedCount[0]+' ('+sortedCount[1]+')';
    list.appendChild(item);
  });
}

function loadStories(visits, nicknames, canvas) {
  while(canvas.firstChild) {
    canvas.removeChild(canvas.firstChild);
  }
  _.map(visits, function(visit) {
    var line = document.createElement('li');
    line.innerText = createStory(visit, nicknames);
    canvas.appendChild(line);
  });
}

function createStory(visit, nicknames) {
  return visit.who+', más conocido como '+nicknames[visit.who]+' ha estado en '+visit.where+createCityStory(visit);
}

function createCityStory(visit) {
  if(!visit.cities || visit.cities.length === 0) {
    return '';
  } else {
    return ' y ha visitado '+createCityList(visit.cities);
  }
}


function createCityList(cities) {
  if(cities.length === 1) {
    return cities[0];
  } else if(cities.length > 1) {
    return cities.splice(0, cities.length -1).join(', ') + ' y '+cities[cities.length - 1];
  }
}

function qccaTravels(map, callback) {
  var travels = [
    { lat: 16, lng: -3, where: 'A', who: 'Toquero', cities: ['a'] },
    { lat: 20, lng: -3, where: 'B', who: 'Toquero', cities: ['b'] },
    { lat: 24, lng: -3, where: 'C', who: 'Toquero', cities: ['c'] },
    { lat: 28, lng: -3, where: 'D', who: 'Toquero', cities: [] },
    { lat: 32, lng: -3, where: 'E', who: 'Toquero', cities: ['e', 'e1'] },
    { lat: 36, lng: -3, where: 'E', who: 'Iván', cities: ['e', 'e2', 'e3'] },
    { lat: 40, lng: -3, where: 'F', who: 'Iván', cities: ['f'] },
    { lat: 44, lng: -3, where: 'B', who: 'Sergio', cities: ['b'] }
  ];
  var nicknames = { 'Toquero': 'Toq', 'Iván': 'Talibán', 'Sergio': 'Sergalo' };
  callback(map, travels, nicknames);
}

function cartoDbTravels() {
  $.getJSON('http://juanignaciosl.cartodb.com/api/v2/sql/?q=select * from matw', function(data) {
      $.each(data.rows, function(key, val) {
        console.log(key);
      });
  });
}

