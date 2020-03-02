import { IonList, IonReorderGroup } from "@ionic/react";
import React from "react";
import ManualFileItem from "./ManualFileItem";
import { ItemReorderEventDetail } from "@ionic/core";

export default class ManualFileList extends React.Component<
  { files: Array<any>; onChange: any },
  {}
> {
  constructor(props: { files: Array<any>; onChange: any }) {
    super(props);
    this.doReorder = this.doReorder.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.changeTargetStart = this.changeTargetStart.bind(this);
    this.changeTargetEnd = this.changeTargetEnd.bind(this);
  }

  deleteItem(file: any) {
    this.props.files.splice(file.id, 1);
    this.props.onChange(this.props.files);
  }

  changeTargetStart(file: { id: any }, value: any) {
    this.props.files[file.id].targetStart = value;
    this.props.onChange(this.props.files);
  }

  changeTargetEnd(file: { id: any }, value: any) {
    this.props.files[file.id].targetEnd = value;
    this.props.onChange(this.props.files);
  }

  doReorder = function(this: any, event: CustomEvent<ItemReorderEventDetail>) {
    event.detail.complete(this.props.files);
    this.props.onChange(this.props.files);
  };
  render() {
    return (
      <IonList>
        <IonReorderGroup disabled={false} onIonItemReorder={this.doReorder}>
          {this.props.files.map(
            (
              file: {
                path: string;
                collapsed: boolean;
                hash: string;
                duration: number;
                targetStart: number;
                targetEnd: number;
                loaded: boolean;
              },
              index
            ) => {
              return (
                <ManualFileItem
                  key={file.hash}
                  file={{
                    id: index,
                    path: file.path,
                    duration: file.duration,
                    targetStart: file.targetStart,
                    targetEnd: file.targetEnd,
                    loaded: file.loaded,
                  }}
                  changeTargetStart={this.changeTargetStart}
                  changeTargetEnd={this.changeTargetEnd}
                  deleteItem={this.deleteItem}
                ></ManualFileItem>
              );
            }
          )}
        </IonReorderGroup>
      </IonList>
    );
  }
}
