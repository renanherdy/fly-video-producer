var express = require("express");
var videoSlicer = require("./workers/videoSlicer");
var videoInfo = require("./workers/videoInfo");
var videoPlayer = require("./workers/videoPlayer");
var imageService = require("./workers/imageService");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http, {
  pingInterval: 3600000,
  pingTimeout: 60000
});

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
  socket.on("start-cutIntoSlices", function(payload) {
    console.log("start cutIntoSlices");
    console.log("payload", payload);
    videoSlicer.cutIntoSlices(payload).then(result => {
      const { resultPath, outSceneName } = result;
      try {
        socket.emit("end-cutIntoSlices-" + outSceneName, result);
      } catch (e) {
        console.log("error server side", e);
      }
      console.log("end-cutIntoSlices-" + outSceneName);
      console.log("result", result);
    });
  });
  socket.on("start-generateThumbnails", function(payload) {
    console.log("start-generateThumbnails");
    console.log("payload", payload);
    imageService.generateThumbnails(payload).then(result => {
      try {
        socket.emit("end-generateThumbnails", result);
      } catch (e) {
        console.log("error server side", e);
      }
      console.log("end-generateThumbnails");
      console.log("result", result);
    });
  });
  socket.on("start-mergeVideos", async function(payload) {
    console.log("start mergeVideos");
    console.log("payload", payload);
    console.log("payload[0].event.payload", payload[0].event.payload);
    const outDir = payload[0].event.payload.outDirPath;
    const result = await videoSlicer.mergeOutputs(
      [payload],
      outDir + "/fly-video.mp4",
      outDir,
      "fly-video"
    );
    const { resultPath, outSceneName } = result;
    console.log("end-mergeVideos-" + outSceneName);
    socket.emit("end-mergeVideos", result);
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
    getFFProbeData(videoFilePath).then(data => {
      console.log("ffprobe data done: ", data);
      socket.emit("videoInfoResp", data);
    });
  });
  socket.on("disconnect", function() {});
});

app.get('/getVideoFile', (req,res) => {
  if(req.query.path&&req.query.path!==""){
    console.log('serving file ', req.query.path);
    res.sendFile(req.query.path);
  }
});
http.listen(3001, function() {
  console.log("Fly Video Producer API listening on port 3001!");
});
