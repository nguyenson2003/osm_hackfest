
//default
var map = L.map('map').fitWorld();
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);
//bật định vị
function onLocationFound(e) {
    var radius = e.accuracy;
    var lat = e.latlng.lat;
    var lng = e.latlng.lng;
    var api_key = 'cd1a5f6ad179bf296cb39abd5e662678';
    var url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${api_key}`;
    console.log(url);
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
        .then(data => {
            var air_widget = `
                Nồng độ không khí ô nhiễm ở khu vực bạn
                <ul>
                    <li>SO<sub>2</sub>: ${data.list['0'].components.so2} μg/m<sup>3</sup></li>
                    <li>NO<sub>2</sub>: ${data.list['0'].components.no2} μg/m<sup>3</sup></li>
                    <li>PM<sub>10</sub>: ${data.list['0'].components.pm10} μg/m<sup>3</sup></li>
                    <li>PM<sub>2.5</sub>: ${data.list['0'].components.pm2_5} μg/m<sup>3</sup></li>
                    <li>O<sub>3</sub>: ${data.list['0'].components.o3} μg/m<sup>3</sup></li>
                    <li>CO: ${data.list['0'].components.co} μg/m<sup>3</sup></li>
                </ul>
                Mức độ: <span style="color:${getColor(data.list['0'].main.aqi)}">${data.list['0'].main.aqi}</span>/5
            `;
            document.getElementById("air-widget").innerHTML = air_widget;
        })
        .catch()

    var url2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${api_key}`
    console.log(url2)
    fetch(url2)
        .then(response => {
            if (!response.ok) throw new Error(response.statusText);
            return response.json();
        })
        .then(data => {
            var list_rain = [0,0,0,0,0];
            var total_rain = 0;
            for(let i=0;i<5;i++){
                for(let j = 0;j<6;j++){
                    if(data.list[i*6+j].rain)
                    list_rain[i]+=data.list[i*6+j].rain['3h'];
                }
                total_rain+=list_rain[i];
            }
            var rain_widget = `
            Đánh giá lượng mưa ở khu vực bạn:
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
            Khả năng xãy ra mưa lũ: ${Math.min((total_rain/(213*5)*100).toFixed(2),90.00)}% <br>
            <i>(giá trị ước tính chung trên lý thuyết, ở một số nơi như thành thị sẽ có khả năng xảy ra lũ thấp hơn dự kiến)</i>
            `
            document.getElementById("rain-widget").innerHTML = rain_widget;


        })
        .catch();
}
map.on('locationfound', onLocationFound);
//không bật định vị
function onLocationError(e) {
    alert(e.message);
}
map.on('locationerror', onLocationError);
map.locate({ setView: true, maxZoom: 16 });

//draw vn
function getColor(d) {
    return d == 1 ? '#3F3' :
        d == 2 ? '#AF3' :
            d == 3 ? '#FF3' :
                d == 4 ? '#FA3' :
                    '#F33';
}