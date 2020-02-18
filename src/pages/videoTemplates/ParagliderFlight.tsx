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
  IonLabel,
  IonInput
} from "@ionic/react";
import React from "react";
import FileList from "../../components/FileList";
import io from "socket.io-client";
import {
  loadProjectFromLocalStorage,
  saveProjectToLocalStorage,
  getCurrentScene,
  saveCurrentSceneToLocalStorage
} from "../../components/StorageManager";
import path from "path";

class ParagliderFlight extends React.Component<
  {
    history: any;
    location: { pathname: string } | any;
  },
  {
    allFilesDuration: number;
    sceneTargetDuration: number;
    fileInput: any;
    timeoutText: string;
    currentScene:
      | {
          inputs: Array<{
            path: string;
            hash: string;
            duration: number;
            targetDuration: number;
            numberOfSlices: number;
            loaded: boolean;
          }>;
        }
      | any;
    project: object | any;
  }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      allFilesDuration: 0,
      sceneTargetDuration: 0,
      timeoutText: "not started yet",
      fileInput: React.createRef(),
      currentScene: { inputs: [] },
      project: {}
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.triggerSelectBox = this.triggerSelectBox.bind(this);
    this.arrayChanged = this.arrayChanged.bind(this);
    this.changeSceneTargetDurationValue = this.changeSceneTargetDurationValue.bind(
      this
    );
    this.updateAllFilesDuration = this.updateAllFilesDuration.bind(this);
    this.recalculateSlices = this.recalculateSlices.bind(this);
  }

  updateAllFilesDuration() {
    this.setState(state => {
      const currentScene = state.currentScene;
      let allFilesDuration = 0;
      for (let file of currentScene.inputs) {
        allFilesDuration += file.duration;
      }
      return { allFilesDuration };
    });
  }

  loadCheckedCurrentScene() {
    const currentScene = getCurrentScene() || {};

    this.completePropertyIfNotPresent(
      currentScene,
      "name",
      "scene" + this.generateHash()
    );
    currentScene.type = this.getSceneType();
    this.completePropertyIfNotPresent(currentScene, "inputs", []);
    currentScene.event = {
      emittedEvent: "start-cutIntoSlices",
      payload: this.generatePayload(
        this.calculateSlices(this.state.currentScene.inputs)
      ),
      responseEvent: "end-cutIntoSlices"
    };
    currentScene.event.payload.outSceneName = currentScene.name;
    return currentScene;
  }
  completePropertyIfNotPresent(
    object: any,
    propertyName: string,
    defaultValue: any
  ) {
    if (!object[propertyName]) {
      object[propertyName] = defaultValue;
    }
  }
  getSceneType() {
    const pathname = this.props.location.pathname;
    return pathname.substring(pathname.lastIndexOf("/") + 1);
  }

  componentDidUpdate() {
    let currentScene = getCurrentScene();

    if (this.state.currentScene.name !== currentScene.name) {
      this.setState(() => {
        currentScene = this.loadCheckedCurrentScene();
        saveCurrentSceneToLocalStorage(currentScene);
        return { currentScene };
      });
    }
  }

  componentDidMount() {
    this.setState(state => {
      const project = loadProjectFromLocalStorage();
      const currentScene = this.loadCheckedCurrentScene();
      console.log("loaded project", project);

      return {
        project: project,
        currentScene
      };
    }, this.updateAllFilesDuration);
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
    this.setState(state => {
      const currentScene = state.currentScene;
      currentScene.inputs = array;
      this.saveCurrentSceneIntoProject(state.project, currentScene);

      saveCurrentSceneToLocalStorage(currentScene);
      return {
        fileInput: state.fileInput,
        currentScene,
        project: state.project
      };
    }, this.updateAllFilesDuration);
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
  findSceneOnProject(project: { scenes: [] }, sceneName: string): number {
    try {
      return project.scenes.findIndex((item: any) => {
        return item.name === sceneName;
      });
    } catch {}
    return -1;
  }
  saveCurrentSceneIntoProject(project: any, scene: { name: string }) {
    const sceneName = scene.name;
    const sceneIndex = this.findSceneOnProject(project, sceneName);
    if (sceneIndex > -1) {
      project.scenes[sceneIndex] = scene;
    } else {
      this.addSceneToProject(project, scene);
    }
  }
  addSceneToProject(project: { scenes: any[] }, scene: { name: string }) {
    if (project.scenes && project.scenes.length > 0) {
      project.scenes = project.scenes.concat(scene);
    } else {
      project.scenes = [scene];
    }
  }
  handleSubmit() {
    console.log("state ", this.state);
    const currentScene = this.state.currentScene;
    const project = this.state.project;
    const payload = this.generatePayload(
      this.calculateSlices(this.state.currentScene.inputs)
    );
    payload.outSceneName = currentScene.name;
    currentScene.event.payload = payload;
    this.saveCurrentSceneIntoProject(project, currentScene);
    saveCurrentSceneToLocalStorage(currentScene);
    saveProjectToLocalStorage(project);
    this.props.history.push("/production", { project });
  }

  getOutDir(file: any, outDirName: string) {
    const filePath = file ? file.path : "~/~/";
    const outDir = path.join(path.dirname(filePath), outDirName);
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
    return array;
  }
  generatePayload(array: any[]) {
    const payload = {
      fileArray: array,
      outDirPath: this.getOutDir(array[0], "output-files"),
      outSceneName: ""
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
      const socket = io("ws://localhost:3001", { transports: ["websocket"] });
      const file = listOfFiles[i];
      if (!file.path) {
        console.log(
          "impossible to compile via browser, please download electron version to produce this video."
        );
        continue;
      }
      const hash = this.generateHash();
      this.insertFileOnList(
        {
          path: file.path,
          hash,
          duration: 0,
          targetDuration: 0,
          numberOfSlices: 0,
          loaded: false
        },
        () => {
          const payload = { videoFilePath: file.path, hash };
          socket.emit("start-getVideoDuration", payload);
          socket.on("end-getVideoDuration", (data: any) => {
            const targetDuration = this.getTargetDuration(data.duration);
            const numberOfSlices = this.getNumberOfSlices(targetDuration);
            const properties = {
              duration: data.duration,
              targetDuration,
              numberOfSlices,
              loaded: true
            };
            this.changeFilePropertiesByHash(data.hash, properties);
            this.updateAllFilesDuration();
            socket.close();
          });
        }
      );
    }
  }
  getNumberOfSlices(targetDuration: number) {
    return Math.ceil(targetDuration / 4);
  }
  getTargetDuration(duration: number) {
    return Math.ceil(duration / 8);
  }

  testHash(this: { hash: string }, item: { hash: string }) {
    return item.hash === this.hash;
  }

  changeFilePropertiesByHash(hash: string, data: any) {
    const testHash = this.testHash.bind({ hash });
    this.setState(state => {
      const listOfFiles = state.currentScene.inputs.map((item: any) => {
        if (testHash(item)) {
          item.duration = data.duration;
          item.targetDuration = data.targetDuration;
          item.numberOfSlices = data.numberOfSlices;
          item.loaded = data.loaded;
        }
        return item;
      });
      const currentScene = state.currentScene;
      currentScene.inputs = listOfFiles;
      saveCurrentSceneToLocalStorage(currentScene);
      return {
        currentScene
      };
    });
  }

  insertFileOnList(
    file: {
      path: string;
      hash: string;
      duration: number;
      targetDuration: number;
      numberOfSlices: number;
      loaded: boolean;
    },
    callback: any
  ) {
    this.setState(state => {
      state.currentScene.inputs = state.currentScene.inputs.concat(file);
      saveCurrentSceneToLocalStorage(state.currentScene);
      return {
        currentScene: state.currentScene
      };
    }, callback);
  }
  changeSceneTargetDurationValue(data: { detail: { value: any } }) {
    let sceneTargetDuration = 1;
    if (Number.isNaN(data.detail.value)) {
      this.setState({ sceneTargetDuration });
    } else {
      sceneTargetDuration = data.detail.value;
      this.setState({ sceneTargetDuration });
    }
  }
  recalculateSlices() {
    this.setState(state => {
      const currentScene = state.currentScene;
      const fraction =
        this.state.sceneTargetDuration / this.state.allFilesDuration;
      for (let file of currentScene.inputs) {
        file.targetDuration = Math.ceil(fraction * file.duration);
        file.numberOfSlices = this.getNumberOfSlices(file.targetDuration);
      }
      return { currentScene };
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
                files={this.state.currentScene.inputs}
                onChange={this.arrayChanged}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="4">
              <IonLabel color="secondary" position="stacked">
                Scene Target duration (s): {this.state.sceneTargetDuration}
              </IonLabel>
              <IonInput
                type="number"
                min="1"
                max={String(this.state.allFilesDuration)}
                onIonChange={this.changeSceneTargetDurationValue}
                value={String(this.state.sceneTargetDuration)}
              ></IonInput>
            </IonCol>
            <IonCol size="8">
              <IonButton
                expand="full"
                size="large"
                onClick={this.recalculateSlices}
                disabled={this.state.currentScene.inputs.length === 0}
              >
                Recalculate slices
              </IonButton>
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonButton
                color="success"
                expand="full"
                size="large"
                onClick={this.handleSubmit}
                disabled={this.state.currentScene.inputs.length === 0}
              >
                Go Back to Production
              </IonButton>
            </IonCol>
          </IonRow>
        </IonContent>
      </IonPage>
    );
  }
}
export default ParagliderFlight;
