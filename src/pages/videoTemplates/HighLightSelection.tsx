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
  IonInput,
  IonGrid,
  IonSpinner
} from "@ionic/react";
import React from "react";
import ManualFileList from "../../components/ManualFileList";
import io from "socket.io-client";
import {
  loadProjectFromLocalStorage,
  saveProjectToLocalStorage,
  getCurrentScene,
  saveCurrentSceneToLocalStorage
} from "../../components/StorageManager";
import path from "path";
import { produceScene } from "../../components/SceneProducer";
import VideoPlayer from "../../components/VideoPlayer";

class HighLightSelection extends React.Component<
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
            targetStart: number;
            targetEnd: number;
            loaded: boolean;
          }>;
        }
      | any;
    project: object | any;
    width: any;
    height: any;
    videoProduced: boolean;
    producedVideoLocation: string;
    producingVideo: boolean;
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
      project: {},
      width: 0,
      height: 0,
      videoProduced: false,
      producedVideoLocation: "",
      producingVideo: false
    };

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.triggerSelectBox = this.triggerSelectBox.bind(this);
    this.arrayChanged = this.arrayChanged.bind(this);
    this.changeSceneTargetDurationValue = this.changeSceneTargetDurationValue.bind(
      this
    );
    this.updateAllFilesDuration = this.updateAllFilesDuration.bind(this);
    this.recalculateSlices = this.recalculateSlices.bind(this);
    this.generatePreview = this.generatePreview.bind(this);
  }
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
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
    currentScene.event = this.generateEvent(currentScene);
    return currentScene;
  }
  generateEvent(currentScene: {
    inputs: {
      path: any;
      duration: number;
      targetStart: number;
      targetEnd: number;
    }[];
    name: string;
  }) {
    const result = {
      emittedEvent: "start-cutIntoSlices",
      payload: this.generatePayload(this.calculateSlices(currentScene.inputs)),
      responseEvent: "end-cutIntoSlices"
    };
    result.payload.outSceneName = currentScene.name;
    return result;
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

  componentDidUpdate(prevProps: any, prevState: any) {
    const locationChanged = prevProps.location !== this.props.location;
    if (locationChanged) {
      console.log("leaving paraglider flight page");
      console.log("prev", prevProps.location);
      console.log("next", this.props.location);
      this.setState(state => {
        const project = loadProjectFromLocalStorage();
        currentScene = getCurrentScene();
        this.saveCurrentSceneIntoProject(project, currentScene);
        saveProjectToLocalStorage(project);
        const videoProduced = false;
        const producedVideoLocation = "";
        return { project, videoProduced, producedVideoLocation };
      });
    }
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

      return {
        project: project,
        currentScene,
        videoProduced: false
      };
    }, this.updateAllFilesDuration);
    window.addEventListener("resize", this.updateWindowDimensions);
    this.updateWindowDimensions();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
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
      currentScene.event = this.generateEvent(currentScene);
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
    currentScene.event = this.generateEvent(currentScene);
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
      targetStart: number;
      targetEnd: number;
    }[]
  ) {
    let array = [];
    for (let file of listOfFiles) {
      let item = {
        path: file.path,
        slices: [{ start: file.targetStart, end: file.targetEnd }]
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
          targetStart: 0,
          targetEnd: 0,
          loaded: false
        },
        () => {
          const payload = { videoFilePath: file.path, hash };
          socket.emit("start-getVideoDuration", payload);
          socket.on("end-getVideoDuration", (data: any) => {
            const targetStart = 0;
            const targetEnd = data.duration;
            const properties = {
              duration: data.duration,
              targetStart,
              targetEnd,
              loaded: true
            };
            this.changeFilePropertiesByHash(data.hash, properties);
            this.updateAllFilesDuration();
            socket.close();
          });
        }
      );
    }
    this.setState((state: any) => {
      const fileInput = state.fileInput;
      fileInput.current.value = null;
      return { fileInput };
    });
  }
  getNumberOfSlices(targetDuration: number) {
    return Math.ceil(targetDuration / 6);
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
          item.targetStart = data.targetStart;
          item.targetEnd = data.targetEnd;
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
      targetStart: number;
      targetEnd: number;
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
      currentScene.event = this.generateEvent(currentScene);
      return { currentScene };
    });
  }
  generatePreview() {
    this.setState({
      producedVideoLocation: "/getVideoFile/?path=",
      videoProduced: false,
      producingVideo: true
    });
    const currentScene = getCurrentScene();

    produceScene(currentScene).then(payload => {
      this.setState({
        producedVideoLocation:
          "/getVideoFile/?path=" +
          payload.resultPath +
          "&t=" +
          String(Date.now()),
        videoProduced: true,
        producingVideo: false
      });
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
            <IonTitle>HighLight Selection</IonTitle>
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
              <ManualFileList
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
            <IonCol size="6">
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
            <IonCol size="6">
              <IonButton
                color="secondary"
                expand="full"
                size="large"
                onClick={this.generatePreview}
                disabled={
                  this.state.currentScene.inputs.length === 0 ||
                  this.state.producingVideo
                }
              >
                Pre Produce Scene
                <IonSpinner slot="end" hidden={!this.state.producingVideo} />
              </IonButton>
            </IonCol>
          </IonRow>
          <IonGrid>
            <IonRow>
              <IonCol size="12">
                <VideoPlayer
                  width={this.state.width}
                  hidden={!this.state.videoProduced}
                  videoPath={this.state.producedVideoLocation}
                />
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }
}
export default HighLightSelection;