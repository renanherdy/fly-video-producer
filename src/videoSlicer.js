const ffmpeg = require('fluent-ffmpeg');
module.exports = autoSlice;

// function autoSlice(){
//   console.log('slice world!');
//   const command = ffmpeg('./source-files/12-02-51-GOPR8939.mp4')
//   .setStartTime(40)
//   .setDuration(5);
//   command
//   .saveToFile('./output-files/slice2.mp4');
//   const command2 = ffmpeg()
//   .addInput('./output-files/slice1.mp4')
//   .mergeAdd('./output-files/slice2.mp4')
//   command2
//   .mergeToFile('./output-files/slice3.mp4', './output-files/');
// }

function autoSlice(element) {
  console.log('auto slicing object');
  const command = ffmpeg(element.localPath)
    .setStartTime(20)
    .setDuration(5);
  command
    .saveToFile('./output-files/slice1.mp4')
    .on('end', () => {
      console.log('slice 1 saved');
      const command2 = ffmpeg(element.localPath)
      command2
        .setStartTime(40)
        .setDuration(5);
      command2
        .saveToFile('./output-files/slice2.mp4')

        .on('end', () => {
          console.log('slice 2 saved');
          const command3 = ffmpeg(element.localPath)
          command3
            .setStartTime(55)
            .setDuration(5);
          command3
            .saveToFile('./output-files/slice3.mp4')
            .on('end', () => {
              console.log('slice 3 saved');
              const command4 = ffmpeg(element.localPath)
              command4
                .setStartTime(65)
                .setDuration(5);
              command4
                .saveToFile('./output-files/slice4.mp4')
                .on('end', () => {
                  console.log('slice 4 saved');
                  const command5 = ffmpeg()
                    .addInput('./output-files/slice1.mp4')
                    .mergeAdd('./output-files/slice2.mp4')
                    .mergeAdd('./output-files/slice3.mp4')
                    .mergeAdd('./output-files/slice4.mp4')
                  command5
                    .mergeToFile('./output-files/autoSliced.mp4', './output-files/')
                    .on('end', () => {
                      console.log('autoSliced saved');
                    });
                });
            });
        });
    });

}