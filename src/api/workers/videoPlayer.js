
const fs = require("fs");
module.exports.getVideoFile = getVideoFile;
async function getVideoFile(payload){
  var videoFile = fs.readFileSync(payload.path);
  return videoFile;
}