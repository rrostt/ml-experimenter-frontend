import React from 'react';
import ReactDOM from 'react-dom';
import DataXYChart from './data-xy-chart';

export default class SimpleGraph extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      width: 400,
    };
  }

  componentDidMount() {
    console.log('mount', ReactDOM.findDOMNode(this).offsetWidth);

    this.onResize = () => {
      this.checkSize();
    };

    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  checkSize() {
    var width = parseInt(ReactDOM.findDOMNode(this).offsetWidth / 2);
    if (width !== this.state.width && width > 0) {
      this.setState({
        width: width,
      });
    }
  }

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
        width={this.state.width}
        height='400'
        />
    </div>;
  }
}
