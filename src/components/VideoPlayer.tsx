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
  constructor(
    props: Readonly<{
      width: any;
      videoPath: string;
      hidden: boolean;
    }>
  ) {
    super(props);
  }
  onComponentDidUpdate(){
    console.log('this.props.videoPath', this.props.videoPath);
  }
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
