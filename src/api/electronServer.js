var express = require("express");
var autoSlice = require("../videoSlicer");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(express.json());

io.on("connection", function(socket) {
  socket.on("start", async function(files) {
    console.log("start 1 message received on server");
    console.log(files);
    const resultPath = await autoSlice(files);
    console.log("end emitted");
    socket.emit("end", "Video produced. You can play!\n" + resultPath);
  });
  socket.on("disconnect", function() {
    console.log("user disconnected");
  });
  console.log("connect works");
});

http.listen(3001, function() {
  console.log("Fly Video Producer API listening on port 3001!");
});
