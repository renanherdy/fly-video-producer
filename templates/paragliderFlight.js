import { autoSlice } from '../src/videoSlicer';

export const init = function () {
  const groups = [];
  // groups.push(intro);
  // groups.push(preFlight);
  // groups.push(takeOff);
  groups.push(flight);
  // groups.push(landing);
  // groups.push(posFlight);

  for (let i = 0; i < groups.length; i++) {
    const element = groups[i];
    element();
  }
}

function flight() {
  const sources = askForFiles();
  const outputs = []
  for (let i = 0; i < sources.length; i++) {
    const element = sources[i];
    outputs.push(autoSlice(element));
  }
}

function askForFiles() {
  const sources = [];
  sources.push({
    localPath: '/home/renanherdy/git/fly-video-producer/source-files/12-02-51-GOPR8939.mp4'
  });
  return sources;
}

// function intro(){
//   const files = askForFiles();

// }

// function preFlight(){
//   const files = askForFiles();
//   const outputs = [];
//   for (let i = 0; i < files.length; i++) {
//     const element = files[i];
//     if(element.type==='image'){
//       outputs.push(treatImg(element));
//     }else if (element.type==='video'){
//       outputs.push(manualSlice(element));
//     }
//   }
// }