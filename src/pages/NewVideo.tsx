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
  IonCardTitle
} from "@ionic/react";
import React from "react";
import { RouteComponentProps } from "react-router";

const NewVideo: React.FC<RouteComponentProps> = props => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>New Video</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonCard>
        <IonCardContent>
          Templates make the video producing more efficient, you can use one of
          the listed or produce your video by adding scenes to the timeline.
        </IonCardContent>
      </IonCard>
      <IonContent>
        <IonList>
          <IonListHeader>
            <IonLabel>Templates</IonLabel>
          </IonListHeader>
          <IonItem>
            <IonCard button onClick={() => props.history.push('/videoTemplates/ParagliderFlight')}>
              <IonCardHeader>
                <IonCardTitle>Paraglider Flight</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                This template will cut your video sources to slices, producing a
                short preview of the whole recorded videos
              </IonCardContent>
            </IonCard>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};
export default NewVideo;
