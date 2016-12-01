import React from 'react';
import SimpleGraph from './simple-graph';
import socket from './socket';

export default class GraphTab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      datasets: [],
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
              name: data.machineId,
              values: data.values,
            },
          ],
        });
      } else {
        var seriesIndex = ds[i].series.findIndex(s => s.name === data.machineId);
        if (seriesIndex === -1) {
          ds[i].series.push({
            name: data.machineId,
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
        <div className='col-xs-12'>
        graphs
        {
          this.state.datasets.map(ds => <SimpleGraph key={ds.name} dataset={ds} />)
        }
        </div>
      </div>
    </div>;
  }
}
