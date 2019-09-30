const ffmpeg = require('fluent-ffmpeg');
module.exports = autoSlice;

function autoSlice(){
  console.log('slice world!');
  const command = ffmpeg('./source-files/12-02-51-GOPR8939.mp4')
  .setStartTime(40)
  .setDuration(5);
  command
  .saveToFile('./output-files/slice2.mp4');
  const command2 = ffmpeg()
  .addInput('./output-files/slice1.mp4')
  .mergeAdd('./output-files/slice2.mp4')
  command2
  .mergeToFile('./output-files/slice3.mp4', './output-files/');
}