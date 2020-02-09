const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");
const path = require("path");

module.exports.getVideoDuration = getVideoDuration;
module.exports.getFFProbeData = getFFProbeData;
async function getVideoDuration(payload) {
  const videoFilePath = payload.videoFilePath;
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoFilePath, (err, data) => {
      if (err) {
        reject(err);
      }
      const response = {duration: data.format.duration, path: data.format.filename}
      resolve(response);
    });
  });
}


async function getFFProbeData(videoFilePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoFilePath, (err, data) => {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};
