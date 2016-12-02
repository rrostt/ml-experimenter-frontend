import React from 'react';

import { LineChart } from 'react-d3';

//import {ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

export default class SimpleGraph extends React.Component {
  render() {
    var lineData = this.props.dataset.series.map(serie => ({
      name: serie.name,
      values: serie.values.slice(-100).map(v => ({ x: +v[0], y: +v[1] })),
      strokeWidth: 1,
    }));

    return <div>
      <LineChart
        legend={true}
        data={lineData}
        width={500}
        height={300}
        title={this.props.dataset.name}
        gridHorizontal={true}
      />
    </div>;

    // var data = this.props.dataset.series.map(serie => ({
    //   name: serie.name,
    //   values: serie.values.map(v => ({ x: +v[0], y: +v[1] })),
    // }));
    //
    // var colors = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
    //
    // return <div>
    //   <ScatterChart width={600} height={400} margin={{top: 20, right: 20, bottom: 20, left: 20}}>
    //   	<XAxis dataKey={'x'} name='stature' unit='cm'/>
    //   	<YAxis dataKey={'y'} name='weight' unit='kg'/>
    //     <CartesianGrid />
    //     <Legend/>
    //     {data.map((serie, i) => <Scatter key={serie.name} name={serie.name} data={serie.values} fill={colors[i]} line isAnimationActive={false}/>)}
    //   </ScatterChart>
    // </div>;
  }
}
