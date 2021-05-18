import React from "react";

export default class SlicedBar extends React.Component<
  {
    totalDuration: number;
    targetDuration: number;
    numberOfSlices: number;
  },
  { array: any[] }
> {
  constructor(
    props: Readonly<{
      totalDuration: number;
      targetDuration: number;
      numberOfSlices: number;
    }>
  ) {
    super(props);
    this.getSliceDiv = this.getSliceDiv.bind(this);
    this.getWidth = this.getWidth.bind(this);
    this.getAllDivs = this.getAllDivs.bind(this);
  }
  getAllDivs(
    totalDuration: number,
    targetDuration: number,
    numberOfSlices: number
  ) {
    const array = [];
    const width = this.getWidth(totalDuration, targetDuration, numberOfSlices);
    for (let i = 0; i < numberOfSlices; i++) {
      array.push(this.getSliceDiv(i, width));
    }
    return array;
  }
  getWidth(
    totalDuration: number,
    targetDuration: number,
    numberOfSlices: number
  ) {
    const percent = (targetDuration / totalDuration / numberOfSlices) * 100;
    return String(percent) + "%";
  }

  getSliceDiv(index: number, width: string) {
    return (
      <div
        style={{
          width: width,
          backgroundColor: "#3C3",
          display: "flex"
        }}
        key={index}
      ></div>
    );
  }
  render() {
    return (
      <div
        style={{
          height: 5,
          backgroundColor: "#666",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          flexWrap: "nowrap",
          alignItems: "stretch"
        }}
      >
        {this.getAllDivs(
          this.props.totalDuration,
          this.props.targetDuration,
          this.props.numberOfSlices
        )}
      </div>
    );
  }
}
