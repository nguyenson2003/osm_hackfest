
//default
var map = L.map('map').fitWorld();
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
map.locate({ setView: true, maxZoom: 16 });
//bật định vị
function onLocationFound(e) {
    var radius = e.accuracy;
    L.marker(e.latlng).addTo(map)
        .bindPopup("You are within " + radius + " meters from this point").openPopup();
    L.circle(e.latlng, radius).addTo(map);


    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    var api_key = 'cd1a5f6ad179bf296cb39abd5e662678';
    var url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${api_key}`;
    console.log(url);
    fetch(url)
        .then(response=>{
            if(!response.ok)throw new Error(response.statusText);
            return response.json();
        })
        .then(data => {
            var weather_widget = `<div class="weather-right__temperature">${(data['main']['temp']-273).toFixed(0)}<span>°C</span></div>
            <table class="weather-right__table">
                <tbody>
                    <tr class="weather-right__items">
                        <th colspan="2" class="weather-right__item">Chi tiết</th>
                    </tr>
                    <tr class="weather-right__items">
                        <td class="weather-right__item">Nhiệt độ</td>
                        <td class="weather-right__item weather-right__feels">${(data['main']['feels_like']-273).toFixed(1)}<span>°C</span></td>
                    </tr>
                    <tr class="weather-right__items">
                        <td class="weather-right__item">Tốc độ gió</td>
                        <td class="weather-right__item weather-right__wind-speed">${data.wind.speed.toFixed(1)} m/s </td>
                    </tr>
                    <tr class="weather-right-card__items">
                        <td class="weather-right__item">Độ ẩm</td>
                        <td class="weather-right__item weather-right__humidity">${(data['main']['humidity']).toFixed(1)}%</td>
                    </tr>
                </tbody>
            </table>`;
            document.getElementById("weather-body").innerHTML=weather_widget;
        })
        .catch()
}
map.on('locationfound', onLocationFound);
//không bật định vị
function onLocationError(e) {
    alert(e.message);
}
map.on('locationerror', onLocationError);
//get position in map
var popup = L.popup();
function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent(`You clicked the map at (${e.latlng.lat.toFixed(3)}, ${e.latlng.lng.toFixed(3)})`)
        .openOn(map);
}
map.on('click', onMapClick);

//draw vn
function getColor(d) {
    return d > 1000 ? '#800026' :
        d > 500 ? '#BD0026' :
            d > 200 ? '#E31A1C' :
                d > 100 ? '#FC4E2A' :
                    d > 50 ? '#FD8D3C' :
                        d > 20 ? '#FEB24C' :
                            d > 10 ? '#FED976' :
                                '#FFEDA0';
}
function style(feature) {
    return {
        fillColor: getColor(52),
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
    });

    layer.bringToFront();
    info.update(layer.feature.properties);
}
function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();

}
function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
}
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
    });
}

//infomation of country
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};
// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Vietnam counntry name</h4>' + (props ?
        '<b>' + props.NAME_1 + '</b>'
        : 'Hover over a state');
};
info.addTo(map);

//bảng chú giải
var legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 10, 20, 50, 100, 200, 500, 1000],
        labels = [];
    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;
};
legend.addTo(map);

geojson = L.geoJson(vndata, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);
L.geoJson(island_data, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);