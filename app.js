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

function speak(text) {
  let utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);

}

function checkmark(bool) {
  if (bool) {
    return "🟢"
  } else {
    return "🔴"
  }
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
// Sensors
var Acceleration =    "Sensor Not Found"
var lux =             "Sensor Not Found"
var gav =             "Sensor Not Found"
var gyro =            "Sensor Not Found"
var orn =             "Sensor Not Found"
if (typeof Accelerometer === "function") {
  const acl = new Accelerometer({ frequency: 60 });
  acl.addEventListener("reading", () => {
    console.log(`Acceleration along the X-axis ${acl.x}`);
    console.log(`Acceleration along the Y-axis ${acl.y}`);
    console.log(`Acceleration along the Z-axis ${acl.z}`);
    Acceleration = `Acceleration: ${acl.x}, ${acl.y}, ${acl.z}`
  });
  acl.start();
}
if ("AmbientLightSensor" in window) {
  const sensor = new AmbientLightSensor({ frequency: 60 });
  sensor.addEventListener("reading", (event) => {
    console.log("Current light level:", sensor.illuminance);
    lux = `Brightness: ${sensor.illuminance} lux`
  });
  sensor.addEventListener("error", (event) => {
    console.log(event.error.name, event.error.message);
  });
  sensor.start();
}
if (typeof GravitySensor === "function") {
  let gravitySensor = new GravitySensor({ frequency: 60 });
  gravitySensor.addEventListener("reading", (e) => {
    console.log(`Gravity along the X-axis ${gravitySensor.x}`);
    console.log(`Gravity along the Y-axis ${gravitySensor.y}`);
    console.log(`Gravity along the Z-axis ${gravitySensor.z}`);
    gav = `Gravity: ${gravitySensor.x}, ${gravitySensor.y}, ${gravitySensor.z}`
  });

  gravitySensor.start();

}
if (typeof Gyroscope === "function") {
  const gyroscope = new Gyroscope({ frequency: 60 });

  gyroscope.addEventListener("reading", (e) => {
    console.log(`Angular velocity along the X-axis ${gyroscope.x}`);
    console.log(`Angular velocity along the Y-axis ${gyroscope.y}`);
    console.log(`Angular velocity along the Z-axis ${gyroscope.z}`);
    gyro = `Angular velocity: ${gyroscope.x}, ${gyroscope.y}, ${gyroscope.z}`
  });
  gyroscope.start();
}
if (typeof AbsoluteOrientationSensor === "function") {
  const options = { frequency: 60, referenceFrame: "device" };
  const sensor = new AbsoluteOrientationSensor(options);

  sensor.addEventListener("reading", () => {
    // model is a Three.js object instantiated elsewhere.
    model.quaternion.fromArray(sensor.quaternion).inverse();
    orn = model.quaternion.fromArray(sensor.quaternion).inverse();

  });
  sensor.addEventListener("error", (error) => {
    if (error.name === "NotReadableError") {
      console.log("Sensor is not available.");
    }
  });
  sensor.start();

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

    document.getElementById("sensortext").innerHTML = `
    ${Acceleration}<br>
    ${lux}<br>
    ${gav}<br>
    ${gyro}<br>
    ${orn}<br>
    `

    window.requestAnimationFrame(tick);
}

document.getElementById('IframeMap').hidden = true
window.requestAnimationFrame(tick);

