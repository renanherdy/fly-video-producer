const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

// const outDir = './output-files/';
// const inDir = './source-files/';
// const mergedFilePath = path.path.join(outDir, 'fly-video.mp4');
const sliceMaxLength = 6;
const sliceMinLength = 4;
const maxSliceQty = 8;

module.exports = async function autoSlice(inputFiles) {
  // cleanOutputDirectory();
  // const inputFiles = await loadInputFiles();
  console.log("autoSlice called");
  console.log("inputFiles");
  console.log(inputFiles);
  const slicingData = await calculateSlicingData(inputFiles);
  console.log("slicing ok");
  const outDir = path.join(path.dirname(inputFiles[0].path), "output-files");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  const mergedFilePath = path.join(outDir, "fly-video.mp4");
  const resp = await renderToFile(slicingData, mergedFilePath, outDir);
  console.log("merge ok");
  return resp;
};
async function renderToFile(slicingData, mergedFilePath, outDir) {
  const outputFiles = [];
  const inputPromises = [];
  let i = 0;
  for (let inputFile of slicingData) {
    inputFile.promisesArray = [];
    for (let slice of inputFile.slices.sliceArray) {
      i++;
      slice.outputPath = path.join(outDir, "slice-" + pad(i, 3) + ".mp4");
      outputFiles.push(slice.outputPath);
      inputFile.promisesArray.push(await saveSlice(inputFile, slice));
    }
    inputPromises.push(
      Promise.all(inputFile.promisesArray)
        .then(data => {
          console.log(inputFile.path + " finished");
          console.log("data");
          console.log(data);
          return data;
        })
        .catch(err => {
          console.log("err");
          console.log(err);
        })
    );
  }
  return Promise.all(inputPromises)
    .then(data => {
      console.log("all input files processed for slicing");
      console.log("data");
      console.log(data);
      return data;
    })
    .then(data => {
      return mergeOutputs(data, mergedFilePath, outDir);
    })
    .then(data =>{
      return data;
    })
    .catch(err => {
      console.log("err");
      console.log(err);
    });
}
async function mergeOutputs(data, mergedFilePath, outDir) {
  return new Promise((resolve, reject) => {
    const ffmpegCommand = ffmpeg();
    console.log("data");
    console.log(data);
    let fileContent = "";
    for (let group of data) {
      for (let file of group) {
        fileContent = fileContent.concat("file '", file.outputPath, "'\n");
      }
    }
    const filenamesPath = path.join(outDir, "filenames.txt");
    fs.writeFileSync(filenamesPath, fileContent);
    const child_process = require("child_process");

    child_process.execSync(
      "ffmpeg -y -f concat -safe 0 -i " +
        filenamesPath +
        " -c copy " +
        mergedFilePath
    );
    // ffmpegCommand
    //   // .addOption("-f", "concat")
    //   // .addOption("-safe", "0")
    //   .addOption("-i", "concat:"+filenamesPath)
    //   .addOption("-c", "copy")
    //   .on('start', (commandLine)=>{

    //     console.log('ffmpegCommand');
    //     console.log(commandLine);
    //   })
    //   .saveToFile(mergedFilePath)
    //   .on("end", () => {
    console.log("renderização concluída");
    resolve(mergedFilePath);
    //   })
    //   .on("error", err => {
    //     console.log(err);
    //     reject(err);
    //   });
  });
}

async function saveSlice(inputFile, slice) {
  return new Promise((resolve, reject) => {
    console.log("saving slice input path");
    console.log(inputFile.path);
    const ffmpegCommand = ffmpeg(inputFile.path);
    ffmpegCommand
      .setStartTime(slice.start)
      .setDuration(inputFile.slices.duration) 
      .addOption("-c", "copy")
      .saveToFile(slice.outputPath)
      .on("end", () => {
        console.log("slice");
        console.log(slice);
        resolve(slice);
      })
      .on("error", err => {
        console.log("saving slice error");
        console.log(err);
        reject(err);
      });
  });
}

function pad(number, width) {
  return new Array(+width + 1 - (number + "").length).join("0") + number;
}

async function calculateSlicingData(inputFiles) {
  const promisesArray = [];
  for (const inputFile of inputFiles) {
    promisesArray.push(
      new Promise((resolve, reject) => {
        console.log("calculating file");
        console.log(inputFile.path);
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
            inputFile.slices.duration =
              sliceMaxLength - (sliceMaxLength - sliceMinLength) / 2;
          } else if (duration <= 5 * sliceMinLength) {
            inputFile.slices.qty = 3;
            inputFile.slices.duration =
              sliceMaxLength - (sliceMaxLength - sliceMinLength) / 2;
          } else if (duration <= 10 * sliceMinLength) {
            inputFile.slices.qty = 4;
            inputFile.slices.duration =
              sliceMaxLength - (sliceMaxLength - sliceMinLength) / 2;
          } else if (duration <= 20 * sliceMinLength) {
            inputFile.slices.qty = 7;
            inputFile.slices.duration =
              sliceMaxLength - (sliceMaxLength - sliceMinLength) / 2;
          } else {
            inputFile.slices.qty = maxSliceQty;
            inputFile.slices.duration = sliceMinLength;
          }
          inputFile.slices.sliceArray = getSliceArray(
            duration,
            inputFile.slices
          );
          console.log("calculated file");
          console.log(inputFile);
          resolve(inputFile);
        });
      })
    );
    //   .saveToFile('./output-files/slice2.mp4')
  }
  return new Promise((resolve, reject) => {
    Promise.all(promisesArray)
      .then(arr => {
        console.log("all sliced");
        console.log(arr);
        resolve(arr);
      })
      .catch(err => {
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
      start: i * slices.duration + i * intervalBetweenSlices,
      stop: i * slices.duration + i * intervalBetweenSlices + slices.duration
    });
  }
  return sliceArray;
}

async function loadInputFiles(inDir) {
  return new Promise((resolve, reject) => {
    const inputFiles = [];
    readdir(inDir, (err, files) => {
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

function cleanOutputDirectory(outDir) {
  readdir(outDir, (err, files) => {
    if (err) throw err;

    for (const file of files) {
      unlink(path.join(outDir, file), err => {
        if (err) throw err;
      });
    }
  });
}
