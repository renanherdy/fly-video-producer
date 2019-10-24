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
  IonButton
} from "@ionic/react";
import React from "react";

class ParagliderFlight extends React.Component<
  {},
  { listOfFiles: Array<string> }
> {
  constructor(props: any) {
    super(props);
    // this.setState({
    //   listOfFiles: [],
    // });

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event: any) {}

  handleChange(event: any) {
    const listOfFiles = event.target.files;
    console.log("listOfFiles");
    console.log(listOfFiles);
    const listOfPaths = [];
    for( let i = 0 ; i<listOfFiles.length; i++){
      listOfPaths.push({path: listOfFiles[i].path});
    }
    console.log("listOfPaths");
    console.log(listOfPaths);


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

    // console.log('listOfPaths');
    // console.log(listOfPaths);
    this.setState({
      listOfFiles
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
          <IonItem>
            <input type="file" multiple onChange={this.handleChange} />
          </IonItem>
          <IonItem>
            <IonButton onClick={this.handleSubmit}>Load Files</IonButton>
          </IonItem>
          <IonList>
            <IonListHeader>Arquivos selecionados</IonListHeader>
          </IonList>
        </IonContent>
      </IonPage>
    );
  }
}
export default ParagliderFlight;
