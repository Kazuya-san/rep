let start = document.getElementById("start"),
  stop = document.getElementById("stop"),
  pause = document.getElementById("pause"),
  resume = document.getElementById("resume"),
  precordedTime = document.getElementById("timerecorded"),
  recordedtimeSecs = 0,
  link = document.getElementById("link"),
  mediaRecorder,
  mediaRecorder2;

let userid = "1627997699294x281358330400967040";
let presentationid = "1636486821918x715220799187058700";

link.href =
  "/watch.html?userid=" + userid + "&presentationid=" + presentationid;

function hasGetUserMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

function hasGetDisplayMedia() {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
}

let handle;

async function recordBoth() {
  console.log("Recording Both");
  let stream2 = await recordwebCam();
  let stream = await recordScreen();
  let mimeType = "video/mp4";
  mediaRecorder2 = createRecorder(stream2, mimeType, "webcam");
  mediaRecorder = createRecorder(stream, mimeType, "slides");
  handle = setInterval(() => {
    recordedtimeSecs += 500 / 1000;
    //convert seconds to hours minutes and seconds
    let hours = Math.floor(recordedtimeSecs / 3600),
      minutes = Math.floor(recordedtimeSecs / 60),
      seconds = Math.floor(recordedtimeSecs % 60);

    precordedTime.innerText = `${hours}:${minutes}:${seconds}`;
  }, 500);
}

start.addEventListener("click", recordBoth);

pause.addEventListener("click", () => {
  //pause the handle
  clearInterval(handle);
  //pause both streams
  mediaRecorder.pause();
  mediaRecorder2.pause();
});

resume.addEventListener("click", () => {
  //resume the handle
  handle = setInterval(() => {
    recordedtimeSecs += 500 / 1000;
    //convert seconds to hours minutes and seconds
    let hours = Math.floor(recordedtimeSecs / 3600),
      minutes = Math.floor(recordedtimeSecs / 60),
      seconds = Math.floor(recordedtimeSecs % 60);

    precordedTime.innerText = `${hours}:${minutes}:${seconds}`;
  }, 500);
  //resume both streams
  mediaRecorder.resume();
  mediaRecorder2.resume();
});

stop.addEventListener("click", function () {
  recordedtimeSecs = 0;
  precordedTime.innerText = `00:00:00`;
  mediaRecorder2.stream.getTracks().forEach((track) => track.stop());
  mediaRecorder.stream.getTracks().forEach((track) => track.stop());
  mediaRecorder2.stop();
  mediaRecorder.stop();
  clearInterval(handle);
});

async function recordScreen() {
  //create a  display media options object
  if (hasGetDisplayMedia()) {
    let displayMediaOptions = {
      video: {
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        frameRate: 30,
        cursor: "always",
      },
      audio: true,
    };

    return await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  } else {
    console.log("Screen Record get display media is not supported");
  }
}

async function recordwebCam() {
  //create a  display media options object
  if (hasGetUserMedia()) {
    let displayMediaOptions = {
      audio: true,
      video: { width: 1280, height: 720, frameRate: 30 },
    };
    return await navigator.mediaDevices.getUserMedia(displayMediaOptions);
  } else {
    console.log("User Media (Camera) not Supported");
  }
}

function createRecorder(stream, mimeType, name) {
  // the stream data is stored in this array
  let recordedChunks = [];

  const mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = function (e) {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };
  mediaRecorder.onstop = function () {
    //saveFile(recordedChunks);
    let blob = new Blob(recordedChunks, { type: mimeType });
    let token =
      "6c67116081747586e65b00b3eaf239fb8fa0068de08f5afb0aa9d93fb757d5b0";
    //"de331d14f20f419fe35af4b365499a9e3e52aa5ef9d044908cf0d89dfadeb124";

    let project_id = "91szic8h95"; //"m63tx4fqry";
    userid = userid.replace(/-/g, "");
    presentationid = presentationid.replace(/-/g, "");

    let filename =
      userid +
      "-" +
      presentationid +
      "-" +
      name +
      "-" +
      new Date().getTime() +
      ".mp4";

    var formdata = new FormData();
    formdata.append("file", blob, filename);
    formdata.append("access_token", token);
    formdata.append("project_id", project_id);

    var requestOptions = {
      method: "POST",
      body: formdata,
      redirect: "follow",
    };

    fetch("https://upload.wistia.com", requestOptions)
      .then((response) => response.text())
      .then((result) => alert("SuccessFully Uploaded"))
      .catch((error) => console.log("error", error));
    recordedChunks = [];
  };

  mediaRecorder.start(200); // For every 200ms the stream data will be stored in a separate chunk.
  return mediaRecorder;
}
