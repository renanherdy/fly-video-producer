var express = require("express");
var autoSlice = require("../videoSlicer");
var app = express();
app.use(express.json());

app.post("/api/autoSlice", slice);
async function slice(req, res) {
  console.log(req.body.listOfPaths);
  var files = req.body.listOfPaths;
  console.log("slicing files");
  console.log(files);
  await autoSlice(files);
  res.send("Sliced");
}

app.listen(3001, function() {
  console.log("Example app listening on port 3001!");
});
