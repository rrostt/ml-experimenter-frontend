import React from 'react';
import socket from './socket';
import config from './config';
import http from './http';

export default class StderrView extends React.Component {
  constructor(props) {
    super(props);

    this.prevMachineId = this.props.machine.id;

    this.state = {
      stderr: this.props.machine.stderr,
    };
  }

  componentWillMount() {
    this.onMachineState = (state) => {
      if (state.id === this.props.machine.id) {
        this.setState({ stderr: state.stderr });
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
        stderr: this.props.machine.stderr,
      });

      this.prevMachineId = this.props.machine.id;
    }
  }

  clear() {
    http.get(config.api + '/machines/' + this.props.machine.id + '/clear-stderr');
  }

  render() {
    return <div>
      <h1>stderr <span className='clear-stderr' onClick={() => this.clear()}>clear</span></h1>
      <pre className='full-stderr'>{this.state.stderr}</pre>
    </div>;
  }
}
