import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCol,
  IonRow,
  IonItem
} from "@ionic/react";
import React from "react";
import FileList from "../../components/FileList";
import io from "socket.io-client";
import {
  loadProjectFromLocalStorage,
  saveProjectToLocalStorage
} from "../../components/StorageManager";
import path from "path";

class ParagliderFlight extends React.Component<
  {},
  {
    listOfFiles: Array<{
      path: string;
      hash: string;
      duration: number;
      targetDuration: number;
      numberOfSlices: number;
      loaded: boolean;
    }>;
    fileInput: any;
    timeoutText: string;
    project: object;
  }
> {
  constructor(props: any) {
    super(props);
    const listOfFiles = this.getListOfFilesFromStorage();
    this.state = {
      timeoutText: "not started yet",
      fileInput: React.createRef(),
      listOfFiles,
      project: {}
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.triggerSelectBox = this.triggerSelectBox.bind(this);
    this.arrayChanged = this.arrayChanged.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
  }

  getListOfFilesFromStorage() {
    const str = localStorage.getItem("currentListOfFiles");
    if (str) {
      try {
        return JSON.parse(str);
      } catch {
      }
    }
    return [];
  }

  saveListOfFilesOnStorage(listOfFiles: any) {
    localStorage.setItem("currentListOfFiles", JSON.stringify(listOfFiles));
  }

  componentDidMount() {
    const project = loadProjectFromLocalStorage();
    console.log("loaded project", project);

    const newState = {
      project: project
    };
    this.setState(newState);
  }

  componentWillUnmount() {
    console.log("before save project", loadProjectFromLocalStorage());
    saveProjectToLocalStorage(this.state.project);
    console.log("after save project", loadProjectFromLocalStorage());
  }

  handleEnd(payload: string) {
    const newState = {
      fileInput: this.state.fileInput,
      listOfFiles: this.state.listOfFiles,
      timeoutText: payload
    };

    this.setState(newState);
  }

  getSliceArray(duration: number, slices: { qty: number; duration: number }) {
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

  arrayChanged(array: any) {
    const newState = {
      fileInput: this.state.fileInput,
      listOfFiles: array
    };

    this.saveListOfFilesOnStorage(array);
    this.setState(newState);
  }

  triggerSelectBox() {
    this.state.fileInput.current.click();
  }

  generateHash() {
    return (
      String(Math.floor(Math.random() * 100000)) +
      String(Math.floor(Math.random() * 100000))
    );
  }

  handleSubmit() {
    const listOfFiles = this.state.listOfFiles;
    const socket = io();
    const payload = this.calculateSlices(listOfFiles);
    socket.emit("start-cutIntoSlices", payload);
    socket.on("end-cutIntoSlices", (payload: any) => {
      socket.close();
      this.handleEnd(payload);
    });

    const newState = {
      fileInput: this.state.fileInput,
      listOfFiles: this.state.listOfFiles,
      timeoutText: "Processing..."
    };
    this.setState(newState);
  }

  getOutDir(basePath: any, outDirName: string) {
    const outDir = path.join(path.dirname(basePath), outDirName);
    return outDir;
  }

  calculateSlices(
    listOfFiles: {
      path: any;
      duration: number;
      targetDuration: number;
      numberOfSlices: number;
    }[]
  ) {
    let array = [];
    for (let file of listOfFiles) {
      let item = {
        path: file.path,
        slices: this.getSlices(
          file.duration,
          file.targetDuration,
          file.numberOfSlices
        )
      };
      array.push(item);
    }
    const payload = {
      fileArray: array,
      outDirPath: this.getOutDir(listOfFiles[0].path, "output-files")
    };
    return payload;
  }
  getSlices(duration: number, targetDuration: number, numberOfSlices: number) {
    if (duration <= targetDuration) {
      return [
        {
          start: 0,
          end: duration
        }
      ];
    } else {
      const wastedTime = duration - targetDuration;
      const wastedSliceDuration = wastedTime / numberOfSlices;
      const offSet = wastedSliceDuration / 2;
      const sliceDuration = targetDuration / numberOfSlices;
      const sliceArray = [];
      for (let i = 1; i <= numberOfSlices; i++) {
        const sliceStart =
          i * wastedSliceDuration - offSet + (i - 1) * sliceDuration;
        sliceArray.push({
          start: sliceStart,
          end: sliceStart + sliceDuration
        });
      }
      return sliceArray;
    }
  }

  handleChange(event: any) {
    const listOfFiles = event.target.files;
    for (let i = 0; i < listOfFiles.length; i++) {
      const socket = io();
      const file = listOfFiles[i];
      if (!file.path) {
        console.log(
          "impossible to compile via browser, please download electron version to produce this video."
        );
        continue;
      }
      const hash = this.generateHash();
      this.insertFileOnList({
        path: file.path,
        hash,
        duration: 0,
        targetDuration: 0,
        numberOfSlices: 0,
        loaded: false
      });
      const payload = { videoFilePath: file.path, hash };
      socket.emit("start-getVideoDuration", payload);
      socket.on("end-getVideoDuration", (data: any) => {
        this.changeFilePropertiesByHash(data.hash, {
          duration: data.duration,
          targetDuration: Math.round(data.duration / 8),
          numberOfSlices: Math.round(data.duration / 20),
          loaded: true
        });
        socket.close();
      });
    }
  }

  testHash(this: { hash: string }, item: { hash: string }) {
    return item.hash === this.hash;
  }

  changeFilePropertiesByHash(hash: string, data: any) {
    const testHash = this.testHash.bind({ hash });
    this.setState(state => {
      const listOfFiles = state.listOfFiles.map(item => {
        if (testHash(item)) {
          item.duration = data.duration;
          item.targetDuration = data.targetDuration;
          item.numberOfSlices = data.numberOfSlices;
          item.loaded = data.loaded;
        }
        return item;
      });
      this.saveListOfFilesOnStorage(listOfFiles);
      localStorage.setItem("currentListOfFiles", JSON.stringify(listOfFiles));
      return {
        listOfFiles
      };
    });
  }

  insertFileOnList(file: {
    path: string;
    hash: string;
    duration: number;
    targetDuration: number;
    numberOfSlices: number;
    loaded: boolean;
  }) {
    this.setState(state => {
      this.saveListOfFilesOnStorage(state.listOfFiles);
      return {
        listOfFiles: state.listOfFiles.concat(file)
      };
    });
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Paraglider Flight</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <input
            ref={this.state.fileInput}
            type="file"
            multiple
            onChange={this.handleChange}
            hidden={true}
          />
          <IonRow>
            <IonCol size="12">
              <IonButton
                expand="full"
                size="large"
                onClick={this.triggerSelectBox}
              >
                Load Files
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <FileList
                files={this.state.listOfFiles}
                onChange={this.arrayChanged}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonButton
                color="success"
                expand="full"
                size="large"
                onClick={this.handleSubmit}
                disabled={this.state.listOfFiles.length === 0}
              >
                Add to Production
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonItem>{this.state.timeoutText}</IonItem>
            </IonCol>
          </IonRow>
        </IonContent>
      </IonPage>
    );
  }
}
export default ParagliderFlight;
