var express = require("express");
var autoSlice = require("./workers/videoSlicer");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
const saveProject = require('./coreInstructions/saveProject')

app.use(express.json());

io.on("connection", function(socket) {
  socket.on("start", async function(files) {
    console.log("start 1 message received on server");
    console.log(files);
    const resultPath = await autoSlice(files);
    console.log("end emitted");
    socket.emit("end", "Video produced. You can play!\n" + resultPath);
  });
  socket.on("newProduction", async function(project){
    console.log("starting save process for new project:" , project.projectName);
    const result = await saveProject(project);
    console.log("project saved, go on!");
    socket.emit("newProductionSaved", "project saved, go on!\n" + result.savedPath);

  })
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
  console.log("connect works");
});

http.listen(3001, function() {
  console.log("Fly Video Producer API listening on port 3001!");
});
