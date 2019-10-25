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
  IonRow} from "@ionic/react";
import React from "react";
import FileList from "../../components/FileList";

class ParagliderFlight extends React.Component<
  {},
  { listOfFiles: Array<{ path: any; hash: any }>; fileInput: any }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      fileInput: React.createRef(),
      listOfFiles: [
        // {
        //   path: "item 1 lodk kk idjndnh asdfasdf dfdfdddddfsdfs",
        //   hash: this.generateHash()
        // },
        // {
        //   path: "item 2 lodk kk idjndnh asdfasdf dfdfdddddfsdfs",
        //   hash: this.generateHash()
        // },
        // {
        //   path: "item 3 lodk kk idjndnh asdfasdf dfdfdddddfsdfs",
        //   hash: this.generateHash()
        // },
        // {
        //   path: "item 4 lodk kk idjndnh asdfasdf dfdfdddddfsdfs",
        //   hash: this.generateHash()
        // }
      ]
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.triggerSelectBox = this.triggerSelectBox.bind(this);
    this.arrayChanged = this.arrayChanged.bind(this);
  }
  arrayChanged(array: any){
    const newState = {
      fileInput: this.state.fileInput,
      listOfFiles: array,
    }
    console.log('onChange');
    console.log(array);
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
    const listOfPaths = this.state.listOfFiles;
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    var req = {
      method: "POST",
      body: JSON.stringify({
        listOfPaths
      }),
      headers: myHeaders
    };
    console.log("auto slice");
    console.log(req);
    fetch("http://localhost:3000/api/autoSlice", req);
  }

  handleChange(event: any) {
    const listOfFiles = event.target.files;
    const listOfPaths = [];
    for (let i = 0; i < listOfFiles.length; i++) {
      const file = listOfFiles[i];
      const hash = this.generateHash();
      if (!file.path) {
        console.log(
          "impossible to compile via browser, please download electron version to produce this video."
        );
        listOfPaths.push({ path: file.name , hash});
        console.log(file);
        continue;
      }
      listOfPaths.push({ path: file.path, hash });
    }
    const newState = {
      listOfFiles: this.state.listOfFiles.concat(listOfPaths)
    };
    console.log('newState');
    console.log(newState);
    this.setState(newState);
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
              <FileList files={this.state.listOfFiles} onChange={this.arrayChanged}/>
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
                Start Producing
              </IonButton>
            </IonCol>
          </IonRow>
        </IonContent>
      </IonPage>
    );
  }
}
export default ParagliderFlight;
