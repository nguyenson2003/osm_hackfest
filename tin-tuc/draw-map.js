
//default
var map = L.map('map').fitWorld();
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
//bật định vị
function onLocationFound(e) {
    var radius = e.accuracy;
    L.marker(e.latlng).addTo(map)
        .bindPopup("Bạn đang ở đây").openPopup();
    L.circle(e.latlng, radius).addTo(map);
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    setWidget(lat, lng, "vị trí của bạn")

}
map.on('locationfound', onLocationFound);
//không bật định vị
function onLocationError(e) {
    alert("Bạn hãy bật định vị để có thể sử dụng 1 số tính năng của trang web");
}
map.on('locationerror', onLocationError);
//set widget wether
function setWidget(lat, lng, nameState) {

    var api_key = 'cd1a5f6ad179bf296cb39abd5e662678';
    if (document.getElementById("weather-body")) {
        var url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${api_key}`;
        console.log(url);
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(data => {
                var weather_widget = `
                <div class="weather-header" style="text-transform: capitalize;">
                    ${nameState}
                </div>
                <div id="weather-body">
                    <div class="weather-right__temperature">${(data['main']['temp'] - 273).toFixed(0)}<span>°C</span></div>
                    <table class="weather-right__table">
                        <tbody>
                            <tr class="weather-right__items">
                                <th colspan="2" class="weather-right__item">Chi tiết</th>
                            </tr>
                            <tr class="weather-right__items">
                                <td class="weather-right__item">Nhiệt độ cảm nhận</td>
                                <td class="weather-right__item weather-right__feels">${(data['main']['feels_like'] - 273).toFixed(1)}<span>°C</span></td>
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
                    </table>
                </div>
                    `;
                document.getElementById("container-weather").innerHTML = weather_widget;
            })
            .catch();
    }
    if (document.getElementById("air-widget")) {
        var url2 = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${api_key}`;
        console.log(url2);
        fetch(url2)
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(data => {
                var air_widget = `
                    Nồng độ không khí ô nhiễm ở ${nameState}:
                    <ul>
                        <li>SO<sub>2</sub>: ${data.list['0'].components.so2} μg/m<sup>3</sup></li>
                        <li>NO<sub>2</sub>: ${data.list['0'].components.no2} μg/m<sup>3</sup></li>
                        <li>PM<sub>10</sub>: ${data.list['0'].components.pm10} μg/m<sup>3</sup></li>
                        <li>PM<sub>2.5</sub>: ${data.list['0'].components.pm2_5} μg/m<sup>3</sup></li>
                        <li>O<sub>3</sub>: ${data.list['0'].components.o3} μg/m<sup>3</sup></li>
                        <li>CO: ${data.list['0'].components.co} μg/m<sup>3</sup></li>
                    </ul>
                    Mức độ: <span style="color:${getColorLevel(data.list['0'].main.aqi)}">${data.list['0'].main.aqi}</span>/5
                `;
                document.getElementById("air-widget").innerHTML = air_widget;
            })
            .catch()
    }
    if (document.getElementById("rain-widget")) {
        var url3 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${api_key}`
        console.log(url3)
        fetch(url3)
            .then(response => {
                if (!response.ok) throw new Error(response.statusText);
                return response.json();
            })
            .then(data => {
                var list_rain = [0, 0, 0, 0, 0];
                var total_rain = 0;
                for (let i = 0; i < 5; i++) {
                    for (let j = 0; j < 6; j++) {
                        if (data.list[i * 6 + j].rain)
                            list_rain[i] += data.list[i * 6 + j].rain['3h'];
                    }
                    total_rain += list_rain[i];
                }
                var rain_widget = `
                Đánh giá lượng mưa ở ${nameState}:
                <ul>
                    <li>Tổng lượng mưa trong 5 ngày: ${total_rain.toFixed(2)}mm</li>
                    <ul>
                        <li>Hôm nay: ${list_rain[0].toFixed(2)}mm</li>
                        <li>Ngày 2: ${list_rain[1].toFixed(2)}mm</li>
                        <li>Ngày 3: ${list_rain[2].toFixed(2)}mm</li>
                        <li>Ngày 4: ${list_rain[3].toFixed(2)}mm</li>
                        <li>Ngày 5: ${list_rain[4].toFixed(2)}mm</li>
                    </ul>
                </ul>
                Khả năng xãy ra mưa lũ: ${Math.min((total_rain / (272 * 5) * 100).toFixed(2), 90.00)}% <br>
                <i>(giá trị được ước tính chung trên lý thuyết, ở một số nơi như thành thị sẽ có khả năng xảy ra lũ thấp hơn dự kiến)</i>
                `
                document.getElementById("rain-widget").innerHTML = rain_widget;


            })
            .catch();
    }
}
//get position in map
var popup = L.popup();
function onMapClick(e) {
    setWidget(e.latlng.lat, e.latlng.lng, curState);
    document.getElementById('main-body').scrollIntoView();
}
map.on('click', onMapClick);

function getColorLevel(d) {
    return d == 1 ? '#3F3' :
        d == 2 ? '#AF3' :
            d == 3 ? '#FF3' :
                d == 4 ? '#FA3' :
                    '#F33';
}

function style(feature) {
    return {
        fillColor: '#FD8D3C',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}
//draw vn
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
function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
    });
}

//infomation of country
var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};
var curState = '';
// method that we will use to update the control based on feature properties passed
info.update = function (props) {
    this._div.innerHTML = '<h4>Vietnam counntry name</h4>' + (props ?
        '<b>' + props.NAME_1 + '</b>'
        : 'Hover over a state');
    curState = props ? props.NAME_1 : "vị trí của bạn";
};
info.addTo(map);
map.locate({ setView: true, maxZoom: 6 });

geojson = L.geoJson(vndata, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);
L.geoJson(island_data, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

