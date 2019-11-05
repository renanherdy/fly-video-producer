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
  }

  deleteItem(file: any) {
    this.props.files.splice(file.id, 1);
    this.props.onChange(this.props.files);
  }

  doReorder = function(this: any, event: CustomEvent<ItemReorderEventDetail>) {
    event.detail.complete(this.props.files);
    this.props.onChange(this.props.files);
  };
  render() {
    return (
      <IonList>
        <IonReorderGroup 
        disabled={false} 
        onIonItemReorder={this.doReorder}
        >
          {this.props.files.map(
            (
              file: { path: string; collapsed: boolean; hash: string },
              index
            ) => {
              return (
                <FileItem
                  key={file.hash}
                  file={{
                    path: file.path,
                    id: index
                  }}
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
