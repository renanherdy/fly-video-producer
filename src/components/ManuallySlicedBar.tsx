import React from "react";

export default class ManuallySlicedBar extends React.Component<
  {
    totalDuration: number;
    slices: [{ start: number; end: number }];
  },
  { array: any[] }
> {
  constructor(props: any) {
    super(props);
    this.getSliceDiv = this.getSliceDiv.bind(this);
    this.getWidth = this.getWidth.bind(this);
    this.getAllDivs = this.getAllDivs.bind(this);
  }
  getAllDivs(
    totalDuration: number,
    slicesArray: [{ start: number; end: number }]
  ) {
    const array = [];
    for (let i = 0; i < slicesArray.length; i++) {
      array.push(
        this.getSliceDiv(
          i,
          this.getLeft(totalDuration, slicesArray[i]),
          this.getWidth(totalDuration, slicesArray[i])
        )
      );
    }
    return array;
  }
  getWidth(totalDuration: number, slice: { start: number; end: number }) {
    const sliceDuration = slice.end - slice.start;
    console.log('slice.end', slice.end);
    console.log('slice.start', slice.start);
    console.log('sliceDuration', sliceDuration);
    
    return this.getPercentualString(sliceDuration / totalDuration);
  }
  getPercentualString(decimal: number){
    const percent = decimal * 100;
    return String(percent) + "%";

  }
  getLeft(totalDuration: number, slice: { start: number; end: number }) {
    return this.getPercentualString(slice.start / totalDuration);
  }

  getSliceDiv(index: number, left: string, width: string) {
    return (
      <div
        style={{
          position: "relative",
          left,
          width,
          top: "0px",
          height: "100%",
          backgroundColor: "#3C3",
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
        }}
      >
        {this.getAllDivs(this.props.totalDuration, this.props.slices)}
      </div>
    );
  }
}
