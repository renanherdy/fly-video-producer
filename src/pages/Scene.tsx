import {
  IonItem,
  IonButton,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonReorder
} from "@ionic/react";
import React from "react";
import { addCircle } from "ionicons/icons";
export default class Scene extends React.Component<
  {
    scene: {
      name: string;
      type: string;
    };
    deleteScene: any;
    loadScene: any;
  },
  {}
> {
  constructor(props: Readonly<any>) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <IonItem>
        <IonCard>
          <IonReorder slot="start" />
          <IonCardHeader>
            <IonCardTitle>{this.props.scene.name}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonCol size="6">{this.props.scene.type}</IonCol>
            <IonCol size="1">
              <IonButton
                onClick={() => {
                  this.props.deleteScene(this.props.scene);
                }}
              >
                <IonIcon name="close-circle" />
              </IonButton>
            </IonCol>
            <IonCol size="1">
              <IonButton
                onClick={() => {
                  this.props.loadScene(this.props.scene);
                }}
              >
                <IonIcon icon={addCircle} />
              </IonButton>
            </IonCol>
          </IonCardContent>
        </IonCard>
      </IonItem>
    );
  }
}
