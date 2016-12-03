import React from 'react';
import ReactDOM from 'react-dom';
import * as d3 from 'd3';

export default class DataXYChart extends React.Component {
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
    var chartTop = 20;
    var chartBottom = this.props.height - 20;
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
      .attr('dy', 9);

    if (!this.svgTitle) {
      this.svgTitle = svg.append('text').attr('class', 'title');
    }

    this.svgTitle
      .text(this.props.title)
      .attr('x', (chartLeft + chartRight) / 2)
      .attr('y', chartTop)
      .attr('text-anchor', 'middle')
      .attr('fill', '#aaa')
      .attr('font-size', 12);
  }

  render() {
    console.log('render');
    return <svg className='data-xy-chart' width={this.props.width} height={this.props.height}>
    </svg>;
  }
}
