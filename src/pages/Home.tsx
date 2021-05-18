import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent
} from "@ionic/react";
import React from "react";
import { add, arrowRoundUp } from "ionicons/icons";
import { RouteComponentProps } from "react-router";

const Home: React.FC<RouteComponentProps> = props => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Fly Video Producer</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="6">
              <IonCard button onClick={() => props.history.push("/production")}>
                <IonCardHeader>
                  <IonCardTitle>New Production</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonIcon icon={add} size="large"></IonIcon>
                </IonCardContent>
              </IonCard>
            </IonCol>
            <IonCol size="6">
              <IonCard button onClick={() => props.history.push("/load")}>
                <IonCardHeader>
                  <IonCardTitle>Load Production</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <IonIcon icon={arrowRoundUp} size="large"></IonIcon>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Home;
