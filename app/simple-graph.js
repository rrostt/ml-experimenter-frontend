import React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

//import { LineChart } from 'react-d3';

//import {ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend} from 'recharts';

class DataXYChart extends React.Component {
  componentDidMount() {
    this.renderData();
  }

  componentWillUpdate() {
    console.log('will update');
  }

  componentDidUpdate() {
    console.log('did update', ReactDOM.findDOMNode(this));
    this.renderData();
  }

  renderData() {
    var svgDOM = ReactDOM.findDOMNode(this);
    var data = this.props.data;
    var chartLeft = 50;
    var chartRight = this.props.width - 50;
    var chartTop = 50;
    var chartBottom = this.props.height - 50;
    var legendLeft = this.props.width - 80;
    var legendTop = 20;
    var legendWidth = 75;
    var legendHeight = data.length * 15;

    var legendPositionX = legendLeft; // initial position
    var legendPositionY = legendTop;

    // figure out axises
    var xExtent = [Number.MAX_VALUE, -Number.MAX_VALUE];
    var yExtent = [Number.MAX_VALUE, -Number.MAX_VALUE];
    xExtent = data.map(d => d3.extent(d.values, d => d.x))
      .reduce((cur, d) => [Math.min(cur[0], d[0]), Math.max(cur[1], d[1])], xExtent);
    yExtent = data.map(d => d3.extent(d.values, d => d.y))
      .reduce((cur, d) => [Math.min(cur[0], d[0]), Math.max(cur[1], d[1])], yExtent);

    var xScale = d3.scaleLinear().domain(xExtent).range([chartLeft, chartRight]);
    var yScale = d3.scaleLinear().domain(yExtent).range([chartBottom, chartTop]);

    var line = d3.line()
      .x(d => xScale(d.x))
      .y(d => yScale(d.y));

    var colors = d3.schemeCategory10;

    var svg = d3.select(svgDOM);
    var seriesSel = svg.selectAll('g.serie').data(data);
    var serieNew = seriesSel.enter().append('g').attr('class', 'serie');

    serieNew.append('path')
      .attr('fill', 'none')
      .attr('stroke', (d, i) => colors[i]);

    seriesSel = svg.selectAll('g.serie').data(data);
    seriesSel.each(function (data, j) { // to get series index j, and function for this
      var dataSel = d3.select(this).selectAll('rect').data(d => d.values);
      dataSel
        .transition()
        .attr('x', d => xScale(d.x) - 1.5)
        .attr('y', d => yScale(d.y) - 1.5);
      dataSel.exit().remove();
      dataSel.enter().append('rect')
        .attr('x', d => xScale(d.x) - 1.5)
        .attr('y', d => yScale(d.y) - 1.5)
        .attr('width', 3)
        .attr('height', 3)
        .attr('fill', (d, i) => colors[j]);
    });

    seriesSel.select('path')
      .transition()
      .attr('d', d => line(d.values));

    // render axises
    var xaxis = d3.axisBottom().scale(xScale);
    var yaxis = d3.axisLeft().scale(yScale);

    if (!this.svgXaxis) {
      this.svgXaxis = svg.append('g');
    }

    if (!this.svgYaxis) {
      this.svgYaxis = svg.append('g');
    }

    this.svgXaxis.attr('transform', `translate(0,${chartBottom})`).call(xaxis);
    this.svgYaxis.attr('transform', `translate(${chartLeft},0)`).call(yaxis);

    // legend
    if (!this.svgLegend) {
      this.svgLegend = svg.append('g').attr('class', 'legend');
      this.svgLegend.attr('transform', `translate(${legendPositionX}, ${legendPositionY})`);
      this.svgLegend.append('rect')
        .attr('x', 0).attr('y', 0).attr('width', legendWidth).attr('height', legendHeight)
        .attr('fill', '#ffd')
        .attr('stroke', '#ddd');

      var dragStart = [0, 0];
      var drag = d3.drag()
        .on('start', () => {
          dragStart = [d3.event.x, d3.event.y];
        })
        .on('drag', () => {
          var newLegendPositionX = legendPositionX + d3.event.x - dragStart[0];
          var newLegendPositionY = legendPositionY + d3.event.y - dragStart[1];
          this.svgLegend.attr('transform', `translate(${newLegendPositionX}, ${newLegendPositionY})`);
        })
        .on('end', () => {
          legendPositionX += d3.event.x - dragStart[0];
          legendPositionY += d3.event.y - dragStart[1];
        });

      this.svgLegend.call(drag);
    }

    var legendGs = this.svgLegend.selectAll('g').data(data);
    legendGs.exit().remove();
    var newG = legendGs.enter().append('g');
    newG.append('rect').attr('class', 'symbol');
    newG.append('text');
    newG.attr('transform', (d, i) => `translate(1.5, ${1.5 + i * 15})`);
    legendGs = this.svgLegend.selectAll('g').data(data);
    legendGs.select('rect.symbol')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 12)
      .attr('height', 12)
      .attr('fill', (d, i) => colors[i]);
    legendGs.select('text')
      .text(d => d.name)
      .attr('font-size', 10)
      .attr('x', 15)
      .attr('dy', 8);
  }

  render() {
    console.log('render');
    return <svg width={this.props.width} height={this.props.height}>
    </svg>;
  }
}

export default class SimpleGraph extends React.Component {
  render() {
    var lineData = this.props.dataset.series.map(serie => ({
      name: serie.name,
      values: serie.values.map(v => ({ x: +v[0], y: +v[1] })),
      strokeWidth: 1,
    }));

    return <div>
      <DataXYChart
        title={this.props.dataset.name}
        data={lineData}
        width='400'
        height='400'
        />
    </div>;

    // return <div>
    //   <LineChart
    //     legend={true}
    //     data={lineData}
    //     width={800}
    //     height={300}
    //     title={this.props.dataset.name}
    //     gridHorizontal={true}
    //   />
    // </div>;

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
