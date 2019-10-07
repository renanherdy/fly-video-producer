const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const path = require('path');
module.exports = autoSlice;


const outDir = './output-files/';
const inDir = './source-files/';
const mergedFilePath = path.join(outDir, 'merged-video.mp4');
const sliceMaxLength = 6;
const sliceMinLength = 3;
const maxSliceQty = 8;

async function autoSlice() {
  // cleanOutputDirectory();
  const inputFiles = await loadInputFiles();
  const slicingData = await calculateSlicingData(inputFiles);
  await renderToFile(slicingData);
}
async function renderToFile(slicingData) {
  const outputFiles = [];
  const inputPromises = [];
  let i = 0;
  for (inputFile of slicingData) {
    inputFile.promisesArray = [];
    for (slice of inputFile.slices.sliceArray) {
      i++;
      slice.outputPath = path.join(outDir, 'slice-' + pad(i, 3) + '.mp4')
      outputFiles.push(slice.outputPath);
      inputFile.promisesArray.push(await saveSlice(inputFile, slice));
    }
    inputPromises.push(Promise.all(inputFile.promisesArray)
      .then((data) => {
        console.log(inputFile.path + ' finished');
        console.log('data');
        console.log(data);
        return data;
      })
      .catch(err => {
        console.log('err');
        console.log(err);
      }));
  }
  Promise.all(inputPromises)
    .then((data) => {
      console.log('all input files processed for slicing');
      console.log('data');
      console.log(data);
      return data;
    })
    .then((data) => {
      return mergeOutputs(data);
    })
    .catch(err => {
      console.log('err');
      console.log(err);
    });
}
async function mergeOutputs(data) {
  return new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg();
    console.log('data');
    console.log(data);
    for (group of data) {
      for (file of group) {
        ffmpegCommand.addInput(file.outputPath);
      }
    }
    ffmpegCommand
      .mergeToFile(mergedFilePath, outDir)
      .on('end', () => {
        console.log('renderização concluída');
        resolve(mergedFilePath);
      })
      .on('error', (err) => {
        console.log(err);
        reject(err);
      })
  });
}

async function saveSlice(inputFile, slice) {
  return new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg(inputFile.path);
    ffmpegCommand
      .setStartTime(slice.start)
      .setDuration(inputFile.slices.duration)
    // .saveToFile(slice.outputPath)
    // .on('end', () => {
    console.log('slice');
    console.log(slice);
    resolve(slice);
    // })
    // .on('error', (err) => {
    //   reject(err);
    // });
  });
}

function pad(number, width) {
  return new Array(+width + 1 - (number + '').length).join('0') + number;
}

async function calculateSlicingData(inputFiles) {
  const promisesArray = [];
  for (const inputFile of inputFiles) {
    promisesArray.push(new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputFile.path, (err, data) => {
        if (err) {
          reject(err);
        }
        inputFile.ffprobeData = data;
        const duration = data.format.duration;
        inputFile.slices = {};

        if (duration <= 2 * sliceMinLength) {
          inputFile.slices.qty = 1;
          inputFile.slices.duration = duration;
        } else if (duration <= 3 * sliceMinLength) {
          inputFile.slices.qty = 2;
          inputFile.slices.duration = sliceMaxLength - ((sliceMaxLength - sliceMinLength) / 2);
        } else if (duration <= 5 * sliceMinLength) {
          inputFile.slices.qty = 3;
          inputFile.slices.duration = sliceMaxLength - ((sliceMaxLength - sliceMinLength) / 3);
        } else if (duration <= 10 * sliceMinLength) {
          inputFile.slices.qty = 5;
          inputFile.slices.duration = sliceMaxLength - ((sliceMaxLength - sliceMinLength) / 4);
        } else if (duration <= 20 * sliceMinLength) {
          inputFile.slices.qty = 7;
          inputFile.slices.duration = sliceMaxLength - ((sliceMaxLength - sliceMinLength) / 2);
        } else {
          inputFile.slices.qty = maxSliceQty;
          inputFile.slices.duration = sliceMinLength;
        }
        inputFile.slices.sliceArray = getSliceArray(duration, inputFile.slices);
        resolve(inputFile);
      });
    }));
    //   .saveToFile('./output-files/slice2.mp4')
  }
  return new Promise((resolve, reject) => {
    Promise.all(promisesArray)
      .then((arr) => {
        resolve(arr);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function getSliceArray(duration, slices) {
  const sliceArray = [];
  const onTime = slices.qty * slices.duration;
  const offTime = duration - onTime;
  if (slices.qty === 1) {

    return [{ start: 0, end: slices.duration }];
  }
  const intervalBetweenSlices = offTime / (slices.qty - 1);
  for (let i = 0; i < slices.qty; i++) {
    sliceArray.push({
      start: (i * slices.duration) + (i * intervalBetweenSlices),
      stop: (i * slices.duration) + (i * intervalBetweenSlices) + slices.duration
    });
  }
  return sliceArray;
}

async function loadInputFiles() {
  return new Promise((resolve, reject) => {
    inputFiles = [];
    fs.readdir(inDir, (err, files) => {
      if (err) {
        reject();
      }
      for (const file of files) {
        inputFiles.push({ path: path.join(inDir, file) });
      }
      resolve(inputFiles);
    });
  });
}

function cleanOutputDirectory() {
  fs.readdir(outDir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      fs.unlink(path.join(outDir, file), err => {
        if (err) throw err;
      });
    }
  });
}
// function autoSlice(){
//   console.log('slice world!');
//   const command = ffmpeg('./source-files/12-02-51-GOPR8939.mp4')
//   .setStartTime(40)
//   .setDuration(5);
//   .saveToFile('./output-files/slice2.mp4')
//   command
//   .saveToFile('./output-files/slice2.mp4');
//   const command2 = ffmpeg()
//   .addInput('./output-files/slice1.mp4')
//   .mergeAdd('./output-files/slice2.mp4')
//   command2
//   .mergeToFile('./output-files/slice3.mp4', './output-files/');
// }

// function autoSlice(element) {
//   console.log('auto slicing object');
//   const command = ffmpeg(element.localPath)
//     .setStartTime(20)
//     .setDuration(5);
//   command
//     .saveToFile('./output-files/slice1.mp4')
//     .on('end', () => {
//       console.log('slice 1 saved');
//       const command2 = ffmpeg(element.localPath)
//       command2
//         .setStartTime(40)
//         .setDuration(5);
//       command2
//         .saveToFile('./output-files/slice2.mp4')

//         .on('end', () => {
//           console.log('slice 2 saved');
//           const command3 = ffmpeg(element.localPath)
//           command3
//             .setStartTime(55)
//             .setDuration(5);
//           command3
//             .saveToFile('./output-files/slice3.mp4')
//             .on('end', () => {
//               console.log('slice 3 saved');
//               const command4 = ffmpeg(element.localPath)
//               command4
//                 .setStartTime(65)
//                 .setDuration(5);
//               command4
//                 .saveToFile('./output-files/slice4.mp4')
//                 .on('end', () => {
//                   console.log('slice 4 saved');
//                   const command5 = ffmpeg()
//                     .addInput('./output-files/slice1.mp4')
//                     .mergeAdd('./output-files/slice2.mp4')
//                     .mergeAdd('./output-files/slice3.mp4')
//                     .mergeAdd('./output-files/slice4.mp4')
//                   command5
//                     .mergeToFile('./output-files/autoSliced.mp4', './output-files/')
//                     .on('end', () => {
//                       console.log('autoSliced saved');
//                     });
//                 });
//             });
//         });
//     });

// }