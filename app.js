var clockmode = true
var displaytick = 0
const display = [
  "-",
  "--",
  "---",
  "----",
]
const delay = ms => new Promise(res => setTimeout(res, ms));
var slider = document.getElementById("fontsizerange");
var fontlabel = document.getElementById("fontlabel");
var frames = 0
date = new Date()
second = date.getSeconds()
minute = date.getMinutes()
hour = date.getHours()

// Update the current slider value (each time you drag the slider handle)
slider.oninput = function() {
  console.log(this.value)
  document.getElementById("head").style.fontSize = `${this.value}px`;
  fontlabel.innerHTML = `Font Size: ${this.value}px`
} 

if ((navigator.oscpu+"").includes("Windows")) {
  //alert("This website is made for phones only. Some elements may be to small to read.")
}

function speak(text) {
  let utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);

}

function startvideo() {
  console.log("Starting camera")
  var video = document.getElementById("video")
  video.setAttribute('playsinline', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('muted', '');
  video.style.width = '100%';
  video.style.height = "100%";

  /* Setting up the constraint */
  var facingMode = "environment"; // Can be 'user' or 'environment' to access back or front camera (NEAT!)
  var constraints = {
    audio: false,
    video: {
     facingMode: facingMode
    }
  };

  /* Stream it to video element */
  navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
    video.srcObject = stream;
    console.log("Camera is streaming")
  });
}

function BatteryLevels() {
  if (typeof(navigator.getBattery)!="undefined") {
    navigator.getBattery().then((battery) => {
      document.getElementById("batterytext").innerHTML = `
      Battery charging: ${checkmark(battery.charging)}<br>
      Battery level: ${battery.level * 100}%<br>
      Battery charging time: ${battery.chargingTime} seconds<br>
      Battery discharging time: ${battery.dischargingTime} seconds<br>
    `
    });

  }
}


function updateMap(latitude=0, longitude=0) {
  const zoom = 900;
  const bbox = [
    longitude - 1/zoom, latitude - 1/zoom, // Southwest corner
    longitude + 1/zoom, latitude + 1/zoom  // Northeast corner
  ].join('%2C');

  const mapSrc = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
  document.getElementById("IframeMap").src  = mapSrc;
}

function updategeo(latitude, longitude, heading, speed, altitude) {
    
    console.log(latitude, longitude)
    displaytick += 1
    speed = speed * 2.2369363 // Meters per second to Miles per hour
    heading = heading * 1
    altitude = altitude * 3.28084 // Meters to feet
    if (heading == null) {
      document.getElementById("locationtext").innerHTML = `Location: ${latitude}, ${longitude}, ${altitude}ft<br>Speed: ${speed}mph<br>${display[displaytick % 4]}`
    } else {
      document.getElementById("locationtext").innerHTML = `Location: ${latitude}, ${longitude}, ${altitude}ft<br>Heading: ${heading}<br>Speed: ${speed}mph`
    }
    
    if (displaytick % 5 == 1) {
      updateMap(latitude, longitude)
      console.log("Updated Mini Map")
    }
    if (displaytick+1 % (3600/5) == 2 && !document.getElementById('weatherl').hidden) {
      getWeather(latitude,longitude)
    }
    //document.getElementById("IframeMap").src = `https://www.openstreetmap.org/export/embed.html?bbox=-0.004017949104309083%2C%2C0.00030577182769775396%2C51.478569861898606&layer=mapnik`
    //https://www.openstreetmap.org/#map=17/42.66923/-82.78201
}

function success(position) {
    updategeo(position.coords.latitude, position.coords.longitude, position.coords.heading, position.coords.speed, position.coords.altitude);
  }
  
  function error() {
    document.getElementById("locationtext").innerHTML = `Error Code: ${error.code}: ${error.message}`
    //alert(`ERROR(${error.code}): ${error.message}`);
    location.reload();
  }
  
  const options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000,
  };
  
  const watchID = navigator.geolocation.watchPosition(success, error, options);

function checkmark(bool) {
  if (bool) {
    return "🟢"
  } else {
    return "🔴"
  }
}

function getWeather(latitude, longitude) {
  const weatherP = document.getElementById('weatherl');
  url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,surface_pressure,visibility,wind_speed_10m,wind_direction_10m,uv_index&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York&forecast_days=1`
  fetch(url)
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        // Log the data
        console.log(data);

        // Display the temperature data
        const hourlyTemperatures = data.hourly.temperature_2m;
        const temp = hourlyTemperatures[hour]
        const atemp = data.hourly.apparent_temperature[hour]
        const hum = data.hourly.relative_humidity_2m[hour]
        const pressure = data.hourly.surface_pressure[hour] * 0.029529983071445
        const sight = data.hourly.visibility[hour] * 0.0001893939
        const uv = data.hourly.uv_index[hour]
        const wind = data.hourly.wind_speed_10m[hour]
        const winddir = data.hourly.wind_direction_10m[hour]

        const per = data.hourly.precipitation[hour]
        const perp = data.hourly.precipitation_probability[hour]

        weatherP.innerHTML = `
        ${temp}°F/${atemp}°F => ${hourlyTemperatures[Math.min(hour + 1,23)]}°F/${data.hourly.apparent_temperature[Math.min(hour + 1,23)]}°F | HUM: ${hum}% | PRES: ${pressure.toFixed(2)} inHg | SEE: ${sight.toFixed(2)} mi <br> UV: ${uv} | WIND: ${wind}mph @ ${winddir}° | PREC: ${per}in ${perp}%`;
    })
    .catch(error => {
        console.error('Error fetching weather data:', error);
        weatherP.innerHTML = `Error fetching weather data: ${error}`
  });
}
  
function tick() {
  frames = frames + 1
    date = new Date()
    second = date.getSeconds()
    minute = date.getMinutes()
    hour = date.getHours()
    
    if (clockmode) {
        document.getElementById("clock").innerHTML = `${hour}:${minute}:${second}`
    } else {
        document.getElementById("clock").innerHTML = date
    }

    BatteryLevels()

    document.getElementById("status").innerHTML = `
    ${checkmark(navigator.geolocation)} 
    ${checkmark(video.srcObject)} 
    ${checkmark(video.classList.contains("nightvison"))} 
    ${checkmark(speechSynthesis)}
    ${checkmark(!document.getElementById('settingsmenu').hidden)}
    ${checkmark(video.classList.contains("termvision"))}
    ${checkmark(!document.getElementById('IframeMap').hidden)}
    ${checkmark(navigator.getBattery)}
    ${checkmark(!document.getElementById('weatherl').hidden)}`

    window.requestAnimationFrame(tick);
}

document.getElementById('IframeMap').hidden = true
window.requestAnimationFrame(tick);

