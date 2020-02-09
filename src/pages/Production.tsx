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
  IonInput,
  IonRow,
  IonCol,
  IonButton
} from "@ionic/react";
import React from "react";
// import io from "socket.io-client";
import {
  getEmptyProject,
  loadProjectFromLocalStorage,
  saveProjectToLocalStorage
} from "../components/StorageManager";

class Production extends React.Component<
  {},
  {
    project: {
      projectName: string | any;
      savedPath: string;
      scenes: [
        {
          name: string,
          type: string,
          inputs: any,
          event: {
            emittedEvent: string,
            payload: any,
            responseEvent: string
          }
        }
      ] | any,
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
  }
> {
  projectNameInput: any;
  constructor(props: any) {
    super(props);
    this.state = {
      fileInput: React.createRef(),
      textMessage: "",
      project: getEmptyProject()
    };
    this.projectNameInput = React.createRef();
    this.triggerSelectBox = this.triggerSelectBox.bind(this);
    this.handleFileChange = this.handleFileChange.bind(this);
    this.newProject = this.newProject.bind(this);
    this.downloadProject = this.downloadProject.bind(this);
  }

  componentDidMount() {
    const project = loadProjectFromLocalStorage();
    console.log("loaded project", project);

    const newState = {
      fileInput: this.state.fileInput,
      textMessage: this.state.textMessage,
      project: project
    };
    this.setState(newState);
  }

  componentWillUnmount() {
    this.logAndSave();
  }

  logAndSave() {
    console.log("before save project storage", loadProjectFromLocalStorage());
    console.log("before save project state", this.state.project);
    saveProjectToLocalStorage(this.state.project);
    console.log("after save project storage", loadProjectFromLocalStorage());
    console.log("after save project state", this.state.project);
  }

  newProject() {
    this.setState(
      state => {
        var newState = { project: { ...state.project } };
        console.log(
          "this.projectNameInput.current.value",
          this.projectNameInput.current.value
        );
        newState.project.projectName = this.projectNameInput.current.value;
        return newState;
      },
      () => {
        this.componentWillUnmount();
      }
    );
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
              <IonLabel>Edit scene</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonCard button routerLink="/videoTemplates/ParagliderFlight">
                <IonCardHeader>
                  <IonCardTitle>Paraglider Flight</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  This template will cut your video sources to slices, producing
                  a short preview of the whole recorded videos
                </IonCardContent>
              </IonCard>
            </IonItem>
          </IonList>
        </IonContent>
        <IonCard>
          <IonCardContent>
            Templates make the video producing more efficient, you can use one
            of the listed or produce your video by adding scenes to the
            timeline.
          </IonCardContent>
        </IonCard>
        <IonContent>
          <IonList>
            <IonListHeader>
              <IonLabel>Add Template to Production</IonLabel>
            </IonListHeader>
            <IonItem>
              <IonCard button routerLink="/videoTemplates/ParagliderFlight">
                <IonCardHeader>
                  <IonCardTitle>Paraglider Flight</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  This template will cut your video sources to slices, producing
                  a short preview of the whole recorded videos
                </IonCardContent>
              </IonCard>
            </IonItem>
          </IonList>
        </IonContent>
      </IonPage>
    );
  }
}
export default Production;
