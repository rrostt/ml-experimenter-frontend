import React from 'react';
import socket from './socket';
import http from './http';

import StreamView from './stream-view';

export default class StreamComponent extends React.Component {
  constructor(props, attrName, clearUrl) {
    super(props);

    this.attrName = attrName;
    this.clearUrl = clearUrl;

    this.prevMachineId = this.props.machine.id;

    this.state = {
      content: this.props.machine[this.attrName],
    };
  }

  componentWillMount() {
    this.onMachineState = (state) => {
      if (state.id === this.props.machine.id) {
        this.setState({ content: state[this.attrName] });
      }
    };

    socket.on('machine-state', this.onMachineState);
  }

  componentWillUnmount() {
    socket.removeListener('machine-state', this.onMachineState);
  }

  componentDidUpdate() {
    if (this.props.machine.id != this.prevMachineId) {
      this.setState({
        content: this.props.machine[this.attrName],
      });

      this.prevMachineId = this.props.machine.id;
    }
  }

  clear() {
    http.get(this.clearUrl);
  }

  render() {
    return <StreamView title={this.attrName} content={this.state.content} onClear={() => this.clear()} />;
  }
}
