import React from 'react';
import socket from './socket';
import config from './config';
import http from './http';

export default class StdoutView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      stdout: this.props.machine.stdout,
    };
  }

  componentWillMount() {
    this.onMachineState = (state) => {
      if (state.id === this.props.machine.id) {
        this.setState({ stdout: state.stdout });
      }
    };

    socket.on('machine-state', this.onMachineState);
  }

  componentWillUnmount() {
    socket.off('machine-state', this.onMachineState);
  }

  clear() {
    http.get(config.api + '/machines/' + this.props.machine.id + '/clear-stdout');
  }

  render() {
    return <div>
      <h1>stdout <span className='clear-stdout' onClick={() => this.clear()}>clear</span></h1>
      <pre className='full-stdout'>{this.state.stdout}</pre>
    </div>;
  }
}
