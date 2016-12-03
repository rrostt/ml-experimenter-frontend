import React from 'react';
import SimpleGraph from './simple-graph';
import socket from './socket';

export default class GraphTab extends React.Component {
  constructor(props) {
    super(props);

    var cos = [];
    var sin = [];
    for (var i = 0; i < 1000; i++) {
      cos.push([i, Math.cos(i * Math.PI * 6 / 1000)]);
      sin.push([i, Math.sin(i * Math.PI * 8 / 1000)]);
    }

    this.state = {
      datasets: [],
      sampleData: {
        series: [
          {
            name: 'cos',
            values: cos,
          },
          {
            name: 'sin',
            values: sin,
          },
        ],
      },

    };
  }

  componentWillMount() {
    this.onDatasetChange = (data) => {
      var ds = this.state.datasets.slice();
      var i = ds.findIndex(ds => ds.name === data.name);
      if (i === -1) {
        ds.push({
          name: data.name,
          series: [
            {
              name: data.machineName,
              values: data.values,
            },
          ],
        });
      } else {
        var seriesIndex = ds[i].series.findIndex(s => s.name === data.machineName);
        if (seriesIndex === -1) {
          ds[i].series.push({
            name: data.machineName,
            values: data.values,
          });
        } else {
          ds[i].series[seriesIndex].values = data.values;
        }
      }

      this.setState({ datasets: ds });
    };

    socket.on('dataset-changed', this.onDatasetChange);
  }

  componentWillUnmount() {
    socket.off('dataset-changed', this.onDatasetChange);
  }

  render() {
    return <div role="tabpanel" className="tab-pane" id="graphs">
      <div className='row'>
        <div className='col-xs-12 graphs-content'>
        {
          this.state.datasets.length > 0 ?
            this.state.datasets.map(ds => <SimpleGraph key={ds.name} dataset={ds} />)
          :
            <p>Graphs of data inferred from stdout of running machines
            will be shown here.</p>
        }
        </div>
      </div>
    </div>;
  }
}
