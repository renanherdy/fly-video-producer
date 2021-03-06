import {
  IonItem,
  IonLabel,
  IonButton,
  IonReorder,
  IonIcon,
  IonRange,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonSpinner
} from "@ionic/react";
import React from "react";
export default class FileItem extends React.Component<
  {
    file: {
      path: string;
      id: number;
      duration: number;
      targetDuration: number;
      numberOfSlices: number;
      loaded: boolean;
    };
    deleteItem: any;
    changeTargetDuration: any;
    changeNumberOfSlices: any;
  },
  { file: { path: string; collapsed: boolean; duration: number } }
> {
  constructor(
    props: Readonly<{
      file: {
        path: string;
        id: number;
        duration: number;
        targetDuration: number;
        numberOfSlices: number;
        loaded: boolean;
      };
      deleteItem: any;
      changeTargetDuration: any;
      changeNumberOfSlices: any;
    }>
  ) {
    super(props);
    this.state = {
      file: {
        path: props.file.path,
        duration: props.file.duration,
        collapsed: true
      }
    };
    this.expandItem = this.expandItem.bind(this);
    this.changeTargetDurationValue = this.changeTargetDurationValue.bind(this);
    this.changeNumberOfSlicesValue = this.changeNumberOfSlicesValue.bind(this);
  }
  expandItem() {
    const newState = this.state;
    newState.file.collapsed = !this.state.file.collapsed;
    this.setState(newState);
  }
  changeTargetDurationValue(data: any) {
    if (Number.isNaN(data.detail.value)) {
      this.props.changeTargetDuration(this.props.file, 1);
      return;
    }
    this.props.changeTargetDuration(this.props.file, data.detail.value);
  }
  changeNumberOfSlicesValue(data: any) {
    if (Number.isNaN(data.detail.value)) {
      this.props.changeNumberOfSlices(this.props.file, 1);
      return;
    }
    this.props.changeNumberOfSlices(this.props.file, data.detail.value);
  }

  render() {
    return (
      <IonItem>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonItem>
                {this.props.file.path}
                <IonReorder slot="start" />
                <IonSpinner slot="end" hidden={this.props.file.loaded}/>
                <IonButton
                  slot="end"
                  color="danger"
                  fill="clear"
                  onClick={() => {
                    this.props.deleteItem(this.props.file);
                  }}
                >
                  <IonIcon name="close-circle" />
                </IonButton>
                <IonButton slot="end" onClick={this.expandItem}>
                  <IonIcon name={(this.state.file.collapsed)?"arrow-dropdown":"arrow-dropup"} />
                </IonButton>
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow hidden={this.state.file.collapsed}>
            <IonCol>
              <IonRow>
                <IonCol size="3">
                  <IonItem>
                    <IonLabel color="secondary" position="stacked">
                      Target duration (s): {this.props.file.targetDuration}
                    </IonLabel>
                    <IonInput
                      type="number"
                      min="1"
                      max={String(this.props.file.duration)}
                      onIonChange={this.changeTargetDurationValue}
                      value={String(this.props.file.targetDuration)}
                    ></IonInput>
                  </IonItem>
                </IonCol>
                <IonCol size="9">
                  <IonRange
                    min={1}
                    max={this.props.file.duration}
                    color="secondary"
                    pin={true}
                    value={this.props.file.targetDuration}
                    class="ion-no-padding"
                    onIonChange={this.changeTargetDurationValue}
                  >
                    <IonLabel slot="start">1</IonLabel>
                    <IonLabel slot="end">{this.props.file.duration}</IonLabel>
                  </IonRange>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="3">
                  <IonItem>
                    <IonLabel color="secondary" position="stacked">
                      Number of slices: {this.props.file.numberOfSlices}
                    </IonLabel>
                    <IonInput
                      type="number"
                      min="1"
                      max={String(Math.round(this.props.file.duration / 3))}
                      onIonChange={this.changeNumberOfSlicesValue}
                      value={String(this.props.file.numberOfSlices)}
                    ></IonInput>
                  </IonItem>
                </IonCol>
                <IonCol size="9">
                  <IonLabel slot="start">Number of slices</IonLabel>
                  <IonRange
                    min={1}
                    max={Math.round(this.props.file.duration / 3)}
                    color="secondary"
                    pin={true}
                    value={this.props.file.numberOfSlices}
                    onIonChange={this.changeNumberOfSlicesValue}
                    class="ion-no-padding"
                  >
                    <IonLabel slot="start">1</IonLabel>
                    <IonLabel slot="end">
                      {Math.round(this.props.file.duration / 3)}
                    </IonLabel>
                  </IonRange>
                </IonCol>
              </IonRow>
              <IonRow>
                <IonCol size="10"></IonCol>
                <IonCol size="2"></IonCol>
              </IonRow>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonItem>
    );
  }
}
