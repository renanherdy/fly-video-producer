import React from "react";

export default class VideoPlayer extends React.Component<
  {
    width: any;
    videoPath: string;
    hidden: boolean;
  },
  {
  }
> {
  render() {
    return (
      <div>
        <video
          src={this.props.videoPath}
          hidden={this.props.hidden}
          width={this.props.width}
          controls
        ></video>
      </div>
    );
  }
}
