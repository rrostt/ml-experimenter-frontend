import React from 'react';
import config from './config';
import socket from './socket';
import http from './http';
import machinesService from './services/machines';

export default class AwsInstanceItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: '',
      error: '',
    };
  }

  componentWillMount() {
    this.onAWS = (data) => {
      if (data.instance && data.instance.instanceId == this.props.instance.instanceId) {
        this.setState({ status: data.status });

        if (data.error) {
          this.setState({ error: data.error });
        }
      }
    };

    socket.on('aws', this.onAWS);

    machinesService.registerComponent(this);
  }

  componentWillUnmount() {
    socket.off('aws', this.onAWS);

    machinesService.unregisterComponent(this);
  }

  start() {
    this.setState({ error: '' });

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
    var confirmed = confirm('Terminate this instance? (All data on instance will be lost)');
    if (!confirmed) {
      return;
    }

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
    var isMachine = this.state.machines.some(
      m => m.awsInstanceId == this.props.instance.instanceId
    );

    var classes = ['aws-instance'];
    classes.push('state-' + this.props.instance.state.Name);
    if (isMachine) {
      classes.push('has-machine');
    }

    var style = {
      background: getBgColorFromState(this.props.instance.state.Name),
    };

    return <div style={style} className={classes.join(' ')}>
      { this.props.instance.state.Name === 'running' ?
        <div className="terminate-instance close" onClick={() => this.terminate()}>&times;</div>
        : null }
      <div className="instance-id" title={this.props.instance.ip}>
        {this.props.instance.instanceId}
      </div>
      <div>
        {this.props.instance.instanceType}
      </div>
      {
        isMachine ?
        'machine up'
        :
        this.props.instance.state.Name === 'running' ?
          this.state.status == 'error' || !this.state.status ?
            <div className="start-machine btn btn-link"
              onClick={() => this.start()}>
              <i className='ion-play'></i> <span style={{ fontSize: 12 }}>run machine</span>
            </div>
          :
            null
        :
          <div>{this.props.instance.state.Name}</div>
      }
      <div className="status">{this.state.status}</div>
      <div>{ this.state.error }</div>
    </div>;

    function getBgColorFromState(state) {
      switch (state) {
        case 'running':
          return isMachine ? 'rgb(192,192,255)' : 'rgb(192,255,192)';
        case 'pending':
          return 'rgb(255,255,192)';
        case 'shutting-down':
          return 'rgb(255,225,192)';
        case 'terminated':
          return 'rgb(255,192,192)';
        default:
          return '#fff';
      }
    }
  }
}
