var clockmode = true
const delay = ms => new Promise(res => setTimeout(res, ms));
if ((navigator.oscpu+"").includes("Windows")) {
  alert("This website is made for phones only. Some elements may be to small to read.")
}

//startvideo()

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


function updategeo(latitude, longitude) {
    console.log(latitude, longitude)
    document.getElementById("locationtext").innerHTML = `Location: ${latitude}, ${longitude}`
    //https://www.openstreetmap.org/#map=17/42.66923/-82.78201
}

function success(position) {
    updategeo(position.coords.latitude, position.coords.longitude);
  }
  
  function error() {
    alert(`ERROR(${error.code}): ${error.message}`);
  }
  
  const options = {
    enableHighAccuracy: true,
    maximumAge: 30000,
    timeout: 27000,
  };
  
  const watchID = navigator.geolocation.watchPosition(success, error, options);
  
function tick() {
    var date = new Date()
    var second = date.getSeconds()
    var minute = date.getMinutes()
    var hour = date.getHours()

    
    if (clockmode) {
        document.getElementById("clock").innerHTML = `${hour}:${minute}:${second}`
    } else {
        document.getElementById("clock").innerHTML = date
    }

    window.requestAnimationFrame(tick);
}

window.requestAnimationFrame(tick);
