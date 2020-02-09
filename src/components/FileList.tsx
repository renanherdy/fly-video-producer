import { IonList, IonReorderGroup } from "@ionic/react";
import React from "react";
import FileItem from "./FileItem";
import { ItemReorderEventDetail } from "@ionic/core";

export default class FileList extends React.Component<
  { files: Array<any>; onChange: any },
  {}
> {
  constructor(props: { files: Array<any>; onChange: any }) {
    super(props);
    this.doReorder = this.doReorder.bind(this);
    this.deleteItem = this.deleteItem.bind(this);
    this.changeNumberOfSlices = this.changeNumberOfSlices.bind(this);
    this.changeTargetDuration = this.changeTargetDuration.bind(this);
  }

  deleteItem(file: any) {
    this.props.files.splice(file.id, 1);
    this.props.onChange(this.props.files);
  }

  changeNumberOfSlices(file: { id: any }, value: any) {
    this.props.files[file.id].numberOfSlices = value;
    this.props.onChange(this.props.files);
  }

  changeTargetDuration(file: { id: any }, value: any) {
    this.props.files[file.id].targetDuration = value;
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
                numberOfSlices: number;
                targetDuration: number;
                loaded: boolean;
              },
              index
            ) => {
              return (
                <FileItem
                  key={file.hash}
                  file={{
                    path: file.path,
                    duration: file.duration,
                    numberOfSlices: file.numberOfSlices,
                    targetDuration: file.targetDuration,
                    id: index,
                    loaded: file.loaded,
                  }}
                  changeNumberOfSlices={this.changeNumberOfSlices}
                  changeTargetDuration={this.changeTargetDuration}
                  deleteItem={this.deleteItem}
                ></FileItem>
              );
            }
          )}
        </IonReorderGroup>
      </IonList>
    );
  }
}
