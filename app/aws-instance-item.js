import React from 'react';
import config from './config';
import socket from './socket';
import http from './http';

export default class AwsInstanceItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: '',
    };
  }

  componentWillMount() {
    this.onAWS = (data) => {
      if (data.instance && data.instance.instanceId == this.props.instance.instanceId) {
        console.log('aws event instance status', data);
        this.setState({ status: data.status });
      }
    };

    socket.on('aws', this.onAWS);
  }

  componentWillUnmount() {
    socket.off('aws', this.onAWS);
  }

  start() {
    if (this.props.instance.state.Name !== 'running') {
      alert('instance not running yet');
      return;
    }

    http.post(
      config.api + '/aws/startMachine',
      {
        instanceId: this.props.instance.instanceId,
      }
    ).then((response) => {
      console.log(response);
    });
  }

  terminate() {
    http.post(
      config.api + '/aws/terminate',
      {
        instanceId: this.props.instance.instanceId,
      }
    ).then(() => {
      if (this.props.onChange) {
        this.props.onChange();
      }
    });
  }

  render() {
    return <div className="aws-instance">
      <div className="instance-id">{this.props.instance.instanceId}</div>
      <div>{this.props.instance.ip}</div>
      <div>>{this.props.instance.state.Name}</div>
      <div className="status">{this.state.status}</div>
      { this.props.instance.state.Name === 'running' ?
      <div className="start-machine btn btn-link" onClick={() => this.start()}>Start machine</div>
      : null }
      { this.props.instance.state.Name !== 'terminated' ?
      <div className="terminate-instance btn btn-link" onClick={() => this.terminate()}>Terminate</div>
      : null }
    </div>;
  }
}
