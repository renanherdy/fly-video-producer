import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonCard,
  IonCardContent,
  IonListHeader,
  IonLabel,
  IonCardHeader,
  IonCardTitle,
  IonReorderGroup,
  IonButton,
  IonSpinner,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol
} from "@ionic/react";
import React from "react";
import io from "socket.io-client";
import {
  getEmptyProject,
  loadProjectFromLocalStorage,
  saveProjectToLocalStorage,
  saveCurrentSceneToLocalStorage
} from "../components/StorageManager";
import { ItemReorderEventDetail } from "@ionic/core";
import Scene from "./Scene";
import { produceScene } from "../components/SceneProducer";
import { playCircle } from "ionicons/icons";

class Production extends React.Component<
  { history: any; location: any },
  {
    producedVideoLocation: string;
    videoProduced: boolean;
    producingVideo: boolean;
    pendingScenes: any;
    project: {
      projectName: string | any;
      savedPath: string;
      scenes:
        | [
            {
              name: string;
              type: string;
              inputs: any;
              event: {
                emittedEvent: string;
                payload: any;
                responseEvent: string;
              };
            }
          ]
        | any;
      instructionGroups:
        | [
            {
              instruction: {
                class: string;
                function: string;
                parameters: [
                  {
                    name: string;
                    value: any;
                  }
                ];
                savedOutputs: [
                  {
                    filePath: string;
                    reuse: boolean;
                  }
                ];
              };
              savedOutputs: [
                {
                  filePath: string;
                  reuse: boolean;
                }
              ];
            }
          ]
        | any;
      savedOutputs:
        | [
            {
              filePath: string;
              reuse: boolean;
            }
          ]
        | any;
    };
    textMessage: string;
    fileInput: any;
    videoPlayerInput: any;
    videoPlayer: any;
    width: any;
    height: any;
  }
> {
  projectNameInput: any;
  constructor(props: any) {
    super(props);
    this.state = {
      producedVideoLocation: "",
      videoProduced: false,
      producingVideo: false,
      pendingScenes: [],
      fileInput: React.createRef(),
      videoPlayerInput: React.createRef(),
      videoPlayer: React.createRef(),
      textMessage: "",
      project: getEmptyProject(),
      width: 0,
      height: 0
    };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.projectNameInput = React.createRef();
    this.triggerSelectBox = this.triggerSelectBox.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.newProject = this.newProject.bind(this);
    this.downloadProject = this.downloadProject.bind(this);
    this.loadScene = this.loadScene.bind(this);
    this.deleteScene = this.deleteScene.bind(this);
    this.addParagliderFlight = this.addParagliderFlight.bind(this);
    this.addHighLightSelection = this.addHighLightSelection.bind(this);
    this.doReorder = this.doReorder.bind(this);
    this.handleEnd = this.handleEnd.bind(this);
    this.produceVideo = this.produceVideo.bind(this);
    this.resolvePendingScene = this.resolvePendingScene.bind(this);
    this.mergeAllScenes = this.mergeAllScenes.bind(this);
    this.leavingPageActions = this.leavingPageActions.bind(this);
    this.enteringPageActions = this.enteringPageActions.bind(this);
    this.verifyAndMerge = this.verifyAndMerge.bind(this);
  }

  componentDidMount() {
    this.enteringPageActions();
  }

  enteringPageActions() {
    const project = loadProjectFromLocalStorage();

    const newState = {
      fileInput: this.state.fileInput,
      textMessage: this.state.textMessage,
      project: project
    };
    this.setState(newState);
    window.addEventListener("resize", this.updateWindowDimensions);
    this.updateWindowDimensions();
    this.props.history.block(this.leavingPageActions);
  }

  leavingPageActions(targetLocation: any) {
    window.removeEventListener("resize", this.updateWindowDimensions);
    return true;
  }

  componentDidUpdate(prevProps: any, prevState: any) {
    const locationChanged = prevProps.location !== this.props.location;
    const project = loadProjectFromLocalStorage();
    if (locationChanged) {
      this.setState(() => {
        return { project };
      });
    }
  }
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  newProject() {
    this.setState(state => {
      var newState = { project: { ...state.project } };
      newState.project.projectName = this.projectNameInput.current.value;
      return newState;
    }, this.enteringPageActions);
  }

  handleProductionSaved(data: any) {
    if (data.project) {
      const newState = {
        fileInput: this.state.fileInput,
        project: data.project,
        textMessage: "Project saved on " + data.project.savedPath
      };
      this.setState(newState);
    } else {
    }
  }

  triggerSelectBox() {
    this.state.fileInput.current.click();
  }
  handleFileChange(event: any) {
    const file = event.target.files[0];
    var newState = this.state;
    newState.project.savedPath = file.path;
    this.setState(newState);
  }
  downloadProject() {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.hidden = true;
    var data = this.state.project;
    var fileName = this.state.project.projectName;
    var json = JSON.stringify(data),
      blob = new Blob([json], { type: "octet/stream" }),
      url = window.URL.createObjectURL(blob);
    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
  }
  doReorder(this: any, event: CustomEvent<ItemReorderEventDetail>) {
    const project = this.state.project;
    event.detail.complete(project.scenes);
    saveProjectToLocalStorage(project);
    this.setState({ project });
  }
  loadScene(scene: any) {
    saveCurrentSceneToLocalStorage(scene);
    this.props.history.push("/videoTemplates/" + scene.type);
  }
  deleteScene(scene: any) {
    this.setState(state => {
      const sceneIndex = this.findSceneIndex(state.project.scenes, scene);
      const project = state.project;
      project.scenes.splice(sceneIndex, 1);
      saveProjectToLocalStorage(project);
      return {
        project
      };
    });
  }

  addHighLightSelection() {
    saveCurrentSceneToLocalStorage({});
    this.props.history.push("/videoTemplates/HighLightSelection");
  }
  addParagliderFlight() {
    saveCurrentSceneToLocalStorage({});
    this.props.history.push("/videoTemplates/ParagliderFlight");
  }

  handleEnd(payload: { outSceneName: string; resultPath: string }) {
    const scene = {
      name: payload.outSceneName,
      resultPath: payload.resultPath
    };
    if (
      Array.isArray(this.state.pendingScenes) &&
      this.state.pendingScenes.length > 0
    ) {
      this.resolvePendingScene(scene, this.verifyAndMerge);
    }
  }
  verifyAndMerge() {
    console.log(
      "this.state.pendingScenes.length",
      this.state.pendingScenes.length
    );
    if (this.state.pendingScenes.length === 0) {
      this.mergeAllScenes();
    }
  }
  findSceneIndex(array: any[], scene: { name: string }) {
    return array.findIndex((item: any) => {
      return item.name === scene.name;
    });
  }
  mergeAllScenes() {
    const socket = io("ws://localhost:3001", { transports: ["websocket"] });
    console.log("merge all scenes ", this.state.project.scenes);
    socket.emit("start-mergeVideos", this.state.project.scenes);
    socket.on("end-mergeVideos", (payload: any) => {
      socket.close();
      this.setState({
        producingVideo: false,
        videoProduced: true,
        producedVideoLocation:
          "/getVideoFile/?path=" +
          payload.resultPath +
          "&t=" +
          String(Date.now())
      });
      console.log("totally merged on: ", payload);
    });
  }

  resolvePendingScene(scene: any, callback: VoidFunction) {
    this.setState(state => {
      const project = state.project;
      const pendingScenes = state.pendingScenes;
      const originalSceneIndex = this.findSceneIndex(project.scenes, scene);
      const sceneIndex = this.findSceneIndex(state.pendingScenes, scene);
      pendingScenes.splice(sceneIndex, 1);
      project.scenes[originalSceneIndex].outputPath = scene.resultPath;
      return {
        pendingScenes,
        project
      };
    }, callback);
  }

  produceVideo() {
    this.setState({ producingVideo: true, videoProduced: false });
    const listOfScenes = this.state.project.scenes;
    const pendingScenes = [];
    for (let scene of listOfScenes) {
      pendingScenes.push(scene);
      produceScene(scene).then(this.handleEnd);
    }
    this.setState({ pendingScenes });
  }

  render() {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/home" />
            </IonButtons>
            <IonTitle>Production</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonGrid>
            <IonRow>
              <IonCol>
                {/* <IonRow>
            <IonCol>
              <IonInput
                type="text"
                placeholder="Awesome project"
                autofocus
                value={this.state.project.projectName}
                ref={this.projectNameInput}
              />
            </IonCol>
            <IonCol>
              <input
                type="file"
                ref={this.state.fileInput}
                onChange={this.handleFileChange}
                hidden={true}
              />
              <IonButton
                expand="full"
                size="large"
                onClick={this.triggerSelectBox}
              >
                Select Project Destination
              </IonButton>
            </IonCol>
            <IonCol>
              <IonButton expand="full" size="large" onClick={this.newProject}>
                Start Project
              </IonButton>
                <IonSpinner slot="end" hidden={this.props.file.loaded} />
            </IonCol>
            <IonCol>
              <IonRow>
                <IonCol>
                  <IonButton onClick={this.downloadProject}>download</IonButton>
                  <IonItem>
                    <h2>{this.state.textMessage}</h2>
                  </IonItem>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol>
                  <h2>{this.state.project.savedPath}</h2>
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow> */}
                <IonList>
                  <IonListHeader>
                    <IonLabel>Edit scenes</IonLabel>
                  </IonListHeader>
                  <IonReorderGroup
                    disabled={false}
                    onIonItemReorder={this.doReorder}
                  >
                    {this.state.project.scenes.map(
                      (item: { name: string; type: string }) => {
                        return (
                          <Scene
                            key={item.name}
                            deleteScene={this.deleteScene}
                            loadScene={this.loadScene}
                            scene={item}
                          ></Scene>
                        );
                      }
                    )}
                  </IonReorderGroup>
                </IonList>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonCard>
                  <IonCardContent>
                    Templates make the video producing more efficient, you can
                    use one of the listed or produce your video by adding scenes
                    to the timeline.
                  </IonCardContent>
                </IonCard>
                <IonList>
                  <IonListHeader>
                    <IonLabel>Add Template to Production</IonLabel>
                  </IonListHeader>
                  <IonItem>
                    <IonCard button onClick={this.addParagliderFlight}>
                      <IonCardHeader>
                        <IonCardTitle>Paraglider Flight</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        This template will cut your video sources to slices,
                        producing a short preview of the whole recorded videos
                      </IonCardContent>
                    </IonCard>
                  </IonItem>
                  <IonItem>
                    <IonCard button onClick={this.addHighLightSelection}>
                      <IonCardHeader>
                        <IonCardTitle>HighLight Selection</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        This template will cut your video manually to make
                        specific recordings available on the output video.
                      </IonCardContent>
                    </IonCard>
                  </IonItem>
                </IonList>
                <IonButton
                  onClick={this.produceVideo}
                  disabled={this.state.producingVideo}
                >
                  Produce Fly Movie!
                </IonButton>
                <IonButton disabled={!this.state.videoProduced}>
                  <IonSpinner slot="end" hidden={!this.state.producingVideo} />
                  <IonIcon
                    icon={playCircle}
                    hidden={this.state.producingVideo}
                  />
                </IonButton>
                <IonGrid>
                  <IonRow>
                    <IonCol size="12">
                      <video
                        ref={this.state.videoPlayer}
                        src={this.state.producedVideoLocation}
                        width={this.state.width + "px"}
                        hidden={!this.state.videoProduced}
                        controls
                      ></video>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
    );
  }
}
export default Production;
