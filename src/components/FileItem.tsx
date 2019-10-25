import {
  IonItem,
  IonLabel,
  IonButton,
  IonReorder,
  IonIcon,
  IonRange,
  IonGrid,
  IonRow,
  IonCol
} from "@ionic/react";
import React from "react";
export default class FileItem extends React.Component<
  { file: { path: string; id: number }; deleteItem: any },
  { file: { path: string; collapsed: boolean } }
> {
  constructor(
    props: Readonly<{ file: { path: string; id: number }; deleteItem: any }>
  ) {
    super(props);
    this.state = {
      file: {
        path: props.file.path,
        collapsed: true
      }
    };
    // this.setState(this.state);

    this.expandItem = this.expandItem.bind(this);
  }
  expandItem() {
    const newState = this.state;
    newState.file.collapsed = !this.state.file.collapsed;
    this.setState(newState);
  }

  render() {
    return (
      <IonItem>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonItem>
                {this.state.file.path}
                <IonReorder slot="start" />
                <IonButton slot="end" onClick={this.expandItem}>
                  <IonIcon name="switch" />
                </IonButton>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow hidden={this.state.file.collapsed}>
            <IonCol>
              <IonRow>
                <IonCol size="12">
                  <IonRange min={-200} max={200} color="secondary" pin={true}>
                    <IonLabel slot="start">-200</IonLabel>
                    <IonLabel slot="end">200</IonLabel>
                  </IonRange>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="10"></IonCol>
                <IonCol size="2">
                  <IonButton
                    color="danger"
                    fill="clear"
                    onClick={() => {
                      this.props.deleteItem(this.props.file);
                    }}
                  >
                    <IonIcon name="close-circle" />
                  </IonButton>
                </IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>
    );
  }
}
