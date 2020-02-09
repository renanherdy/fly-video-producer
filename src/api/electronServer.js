var express = require("express");
var videoSlicer = require("./workers/videoSlicer");
var videoInfo = require("./workers/videoInfo");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.json());

io.on("connection", function(socket) {
  socket.on("start-getVideoDuration", async function(payload) {
    console.log("start getVideoDuration");
    console.log("payload", payload);
    const data = await videoInfo.getVideoDuration(payload);
    data.hash = payload.hash;
    console.log("end emitted");
    socket.emit("end-getVideoDuration", data);
  });
  socket.on("start-cutIntoSlices", async function(payload) {
    console.log("start cutIntoSlices");
    console.log("payload", payload);
    const resultPath = await videoSlicer.cutIntoSlices(payload);
    console.log("end emitted");
    socket.emit("end-cutIntoSlices", "Video cutten Into Slices. You can play!\n" + resultPath);
  });
  socket.on("start", async function(files) {
    console.log("start 1 message received on server");
    console.log(files);
    const resultPath = await autoSlice(files);
    console.log("end emitted");
    socket.emit("end", "Video produced. You can play!\n" + resultPath);
  });
  socket.on("videoInfoReq", async function(videoFilePath) {
    console.log("getting ffProbe data");
    getFFProbeData(videoFilePath)
    .then((data)=>{
      console.log("ffprobe data done: ", data);
      socket.emit("videoInfoResp", data);
    });
  });
  socket.on("disconnect", function() {
  });
});

http.listen(3001, function() {
  console.log("Fly Video Producer API listening on port 3001!");
});
