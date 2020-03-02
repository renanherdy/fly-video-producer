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
import { arrowDropdown, arrowDropup } from "ionicons/icons";
import ManuallySlicedBar from "./ManuallySlicedBar";
export default class ManualFileItem extends React.Component<
  {
    file: {
      id: number;
      targetStart: number;
      targetEnd: number;
      path: string;
      // slices: [
      //   {
      //     start: number;
      //     end: number;
      //   }
      // ];
      duration: number;
      loaded: boolean;
    };
    changeTargetStart: any;
    changeTargetEnd: any;
    deleteItem: any;
  },
  { file: { collapsed: boolean } }
> {
  constructor(props: any) {
    super(props);
    this.state = {
      file: {
        collapsed: true
      }
    };
    this.expandItem = this.expandItem.bind(this);
    this.changeTargetSliceValues = this.changeTargetSliceValues.bind(this);
    this.changeTargetEndValue = this.changeTargetEndValue.bind(this);
    this.changeTargetStartValue = this.changeTargetStartValue.bind(this);
    this.getRangeValues = this.getRangeValues.bind(this);
  }
  expandItem() {
    this.setState((state: any) => {
      const file = state.file;
      file.collapsed = !file.collapsed;
      return { file };
    });
  }
  changeTargetEndValue(data: any) {
    if (Number.isNaN(data.detail.value)) {
      this.props.changeTargetEnd(this.props.file, 1);
      return;
    }
    this.props.changeTargetEnd(this.props.file, data.detail.value);
  }
  changeTargetStartValue(data: any) {
    if (Number.isNaN(data.detail.value)) {
      this.props.changeTargetStart(this.props.file, 0);
      return;
    }
    this.props.changeTargetStart(this.props.file, data.detail.value);
  }

  changeTargetSliceValues(data: any) {
    if (
      Number.isNaN(data.detail.value.lower) ||
      Number.isNaN(data.detail.value.upper)
    ) {
      this.props.changeTargetStart(this.props.file, 0);
      this.props.changeTargetEnd(this.props.file, this.props.file.duration);
      return;
    }
    if(data.detail.value.lower===this.props.file.targetStart &&
      data.detail.value.upper===this.props.file.targetEnd){
        console.log('equalValues');
        return;
      }
    console.log("data event", data);
    this.props.changeTargetStart(this.props.file, data.detail.value.lower);
    this.props.changeTargetEnd(this.props.file, data.detail.value.upper);
  }
  getRangeValues() {
    return {
      lower: this.props.file.targetStart,
      upper: this.props.file.targetEnd
    };
  }
  render() {
    return (
      <IonItem>
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <ManuallySlicedBar
                // slices={this.props.file.slices}
                slices={[
                  {
                    start: this.props.file.targetStart,
                    end: this.props.file.targetEnd
                  }
                ]}
                totalDuration={this.props.file.duration}
              />
            </IonCol>
          </IonRow>
          <IonRow>
            <IonCol size="12">
              <IonItem>
                {this.props.file.path}
                <IonSpinner slot="end" hidden={this.props.file.loaded} />
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
                  <IonIcon
                    icon={
                      this.state.file.collapsed ? arrowDropdown : arrowDropup
                    }
                  />
                </IonButton>
                <IonReorder slot="end" />
              </IonItem>
            </IonCol>
          </IonRow>
          <IonRow hidden={this.state.file.collapsed}>
            <IonCol>
              <IonRow>
                <IonCol size="2">
                  <IonLabel color="secondary" position="stacked">
                    Target start (s): {this.props.file.targetStart}
                  </IonLabel>
                  <IonInput
                    type="number"
                    min="1"
                    max={String(this.props.file.duration)}
                    onIonChange={this.changeTargetStartValue}
                    value={String(this.props.file.targetStart)}
                  ></IonInput>
                </IonCol>
                <IonCol size="8">
                  <IonRange
                    dualKnobs={true}
                    min={0}
                    max={this.props.file.duration}
                    color="secondary"
                    pin={true}
                    value={this.getRangeValues()}
                    class="ion-no-padding"
                    onIonChange={this.changeTargetSliceValues}
                  >
                    <IonLabel slot="start">
                      {this.props.file.targetStart}
                    </IonLabel>
                    <IonLabel slot="end">{this.props.file.duration}</IonLabel>
                  </IonRange>
                </IonCol>
                <IonCol size="2">
                  <IonLabel color="secondary" position="stacked">
                    Target end: {this.props.file.targetEnd}
                  </IonLabel>
                  <IonInput
                    type="number"
                    min="1"
                    max={String(Math.round(this.props.file.duration))}
                    onIonChange={this.changeTargetEndValue}
                    value={String(this.props.file.targetEnd)}
                  ></IonInput>
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
