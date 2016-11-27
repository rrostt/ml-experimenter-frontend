import React from 'react';

import { LineChart } from 'react-d3';

export default class SimpleGraph extends React.Component {
  render() {
    console.log(this.props.dataset);

    // var lineData = {
    //   name: this.props.dataset.name,
    //   values: this.props.dataset.values.map(v => ({ x: v[0], y: v[1] })),
    // };
    // var lineData = [
    //   {
    //     name: this.props.dataset.name,
    //     values: this.props.dataset.values.map(v => ({ x: +v[0], y: +v[1] })),
    //     strokeWidth: 3,
    //     strokeDashArray: "5,5",
    //   },
    // ];

    var lineData = this.props.dataset.series.map(serie => ({
      name: serie.name,
      values: serie.values.map(v => ({ x: +v[0], y: +v[1] })),
      strokeWidth: 3,
      strokeDashArray: '5,5',
    }));

    return <div>
      <LineChart
        legend={true}
        data={lineData}
        width={400}
        height={300}
        title={this.props.dataset.name}
        gridHorizontal={true}
      />
    </div>;
  }
}
