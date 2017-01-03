import React from 'react';
import config from './config';
import socket from './socket';
import http from './http';
import machinesService from './services/machines';
import Modal from './modal';

export default class AwsInstanceItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: '',
      error: '',
      instanceStatus: '',
      showStartModal: false,
      listening: false,
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

    if (this.props.instance.state.Name === 'running') {
      if (this.state.instanceStatus !== 'ok') {
        this.fetchStatus();
      }
    }
  }

  componentWillUnmount() {
    socket.removeListener('aws', this.onAWS);

    machinesService.unregisterComponent(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.instance.state.Name !== 'running' &&
        nextProps.instance.state.Name === 'running') {
      this.fetchStatus();
    }
  }

  fetchStatus() {
    http.get('/aws/instanceStatus/' + this.props.instance.instanceId)
    .then(response => {
      this.setState({
        instanceStatus: response.status,
      });

      if (response.status === 'initializing') {
        setTimeout(() => this.fetchStatus(), 1000);
      }
    });
  }

  showStartModal() {
    this.setState({
      showStartModal: true,
    });
  }

  onShowStartModalClose() {
    this.setState({
      showStartModal: false,
    });
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

  startAndListen() {
    this.setState({ error: '' });

    http.post(
      config.api + '/aws/startMachine',
      {
        instanceId: this.props.instance.instanceId,
        openPort: true,
      }
    ).then((response) => {
      console.log('startMachine done', response);

      this.setState({ listening: true, connecting: true });

      var host = `http://${this.props.instance.ip}:8765`;

      setTimeout(() => {
        http.post(
          '/machines/connect',
          {
            host: host,
          }
        ).then(() => {
          console.log('connect sent');

          this.setState({ connecting: false });
        },

        err => {
          console.log('error', err);
          this.setState({ connecting: false });
        });
      }, 2000);
    });
  }

  reconnect() {
    var host = `http://${this.props.instance.ip}:8765`;
    this.setState({ connecting: true });
    http.post(
      '/machines/connect',
      {
        host: host,
      }
    ).then(() => {
      console.log('connect sent');

      this.setState({ connecting: false });
    },

    err => {
      console.log('error', err);
      this.setState({ connecting: false });
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

    var classes = [
      'aws-instance',
      'state-' + this.props.instance.state.Name,
    ];
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
      <div className='instance-type'>
        {this.props.instance.instanceType}
      </div>
      {
        isMachine ?
          'machine up'
        :
        (
          this.props.instance.state.Name === 'running' ? (
            this.state.instanceStatus === 'ok' ? (
              this.state.status == 'error' || !this.state.status ? (
                <div className="start-machine btn btn-link"
                  onClick={() => this.showStartModal()}>
                  <i className='ion-play'></i> <span style={{ fontSize: 12 }}>run machine</span>
                </div>
              ) : (
                this.state.listening ? (
                  this.state.connecting ? (
                    <p>connecting...</p>
                  ) : (
                    <div className="start-machine btn btn-link"
                      onClick={() => this.reconnect()}>
                      <i className='ion-play'></i> <span style={{ fontSize: 12 }}>reconnect</span>
                    </div>
                  )
                ) : null
              )
            ) : (
              <div>{ this.state.instanceStatus }</div>
            )
          ) : (
            <div>{this.props.instance.state.Name}</div>
          )
        )
      }
      <div className="status">{this.state.status}</div>
      <div>{ this.state.error }</div>
      {
        this.state.showStartModal ?
        <Modal title='Run machine' onClose={() => this.onShowStartModalClose()}>
          <div className='button-group'>
            <p>
              If your server is configured correctly and publically accessible,
              then you can start a machine and let it connect to this host.
              <br/>
              <button className='btn btn-primary' onClick={() => this.start()}>Start and connect</button>
            </p>
            <p>
              If your server is not configured properly, or you are running this
              locally on your machine, you can instead start a machine that
              allows this host to connect to it. This feature is very experimental.
              <br/>
              <button className='btn btn-primary' onClick={() => this.startAndListen()}>Start and listen</button>
            </p>
          </div>
        </Modal>
        :
        null
      }
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
