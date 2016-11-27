import React from 'react';
import socket from './socket';
import config from './config';
import http from './http';

export default class StdoutView extends React.Component {
  constructor(props) {
    super(props);

    this.prevMachineId = this.props.machine.id;

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

  componentDidUpdate() {
    if (this.props.machine.id != this.prevMachineId) {
      this.setState({
        stdout: this.props.machine.stdout,
      });

      this.prevMachineId = this.props.machine.id;
    }
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
