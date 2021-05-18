const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");
const child_process = require("child_process");
/*
const api = {
  // input : {path: "string", hash: "string", slices: [{start: seconds, stop: seconds}]}
  cutIntoSlices: cutIntoSlices
  //TODO list all methods of this api and the expected result of each call
};
*/

module.exports.generateThumbnails = generateThumbnails;

async function generateThumbnails(payload) {
  const filePath = payload.videoPath;
  const outDirPath = path.dirname(filePath);
  const subfolderName = "thumbnails";
  const thumbnailsPath = path.join(outDirPath, subfolderName);
  const outDir = assureDirExistence(thumbnailsPath);
  const interval = "9";

  child_process.execSync(
    "ffmpeg -i '" +
      filePath +
      "' -vf fps=1/" +
      interval +
      " '" +
      thumbnailsPath +
      "/capa-%04d.jpg'"
  );

  putCaption(outDir, "capa-0001.jpg");

  return outDir;
}
function putCaption(outDir, fileName) {
  const gm = require("gm");
  gm(path.join(outDir, fileName))
    .resize(353, 257)
    .autoOrient()
    .write(fileName, function(err) {
      if (!err) {console.log(" hooray! ")}
      else{
        console.log("err", err);
      };
    });
}

async function renderToFile(slicingData, mergedFilePath, outDir, outSceneName) {
  const outputFiles = [];
  const inputPromises = [];
  let i = 0;
  for (let inputFile of slicingData) {
    inputFile.promisesArray = [];
    console.log("inputFile", inputFile);
    for (let slice of inputFile.slices) {
      i++;
      slice.outputPath = path.join(
        outDir,
        "slice-" + outSceneName + "-" + pad(i, 3) + ".mp4"
      );
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
      return mergeOutputs(data, mergedFilePath, outDir, outSceneName);
    })
    .then(data => {
      return data;
    })
    .catch(err => {
      console.log("err");
      console.log(err);
    });
}

function getMergedPath(outDir, videoName) {
  return path.join(outDir, videoName);
}

function assureDirExistence(outDir) {
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  return outDir;
}

async function autoSlice(inputFiles) {
  console.log("autoSlice called");
  console.log("inputFiles", inputFiles);
  const slicingData = await calculateSlicingData(inputFiles);
  console.log("slicing ok");
  const outDir = path.join(path.dirname(inputFiles[0].path), "output-files");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }
  const mergedFilePath = getMergedPath(outDir, "fly-video.mp4");
  const resp = await renderToFile(slicingData, mergedFilePath, outDir);
  console.log("merge ok");
  return resp;
}

async function mergeOutputs(data, mergedFilePath, outDir, outSceneName) {
  return new Promise((resolve, reject) => {
    console.log("data", data);
    let fileContent = "";
    for (let group of data) {
      for (let file of group) {
        fileContent = fileContent.concat("file '", file.outputPath, "'\n");
      }
    }
    const filenamesPath = path.join(
      outDir,
      "filenames-" + outSceneName + ".txt"
    );
    fs.writeFileSync(filenamesPath, fileContent);
    const child_process = require("child_process");

    child_process.execSync(
      "ffmpeg -y -f concat -safe 0 -i '" +
        filenamesPath +
        "' -c copy '" +
        mergedFilePath +
        "'"
    );
    console.log("renderização concluída");
    resolve({ resultPath: mergedFilePath, outSceneName });
  });
}

async function saveSlice(inputFile, slice) {
  return new Promise((resolve, reject) => {
    console.log("saving slice input path", inputFile.path);
    const ffmpegCommand = ffmpeg(inputFile.path);
    ffmpegCommand
      .setStartTime(slice.start)
      .setDuration(slice.end - slice.start)
      .addOption("-c", "copy")
      .addOption(
        "-avoid_negative_ts",
        "make_zero"
      ) /* solves stuttering problem on output videos */
      .saveToFile(slice.outputPath)
      .on("end", () => {
        console.log("slice", slice);
        resolve(slice);
      })
      .on("error", err => {
        console.log("saving slice error", err);
        reject(err);
      });
  });
}

function pad(number, width) {
  return new Array(+width + 1 - (number + "").length).join("0") + number;
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
