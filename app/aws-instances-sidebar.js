import React from 'react';
import AwsInstancesList from './aws-instances-list';

import settings from './localSettings';
import SettingsView from './settings-view';
import config from './config';
import http from './http';
import socket from './socket';

export default class AwsInstancesSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasCredentials: false,
      instances: [],
      showSettings: false,
      awsError: undefined,
      awsState: '',
    };
  }

  componentWillMount() {
    this.fetchInstances();

    this.onAWS = (data) => {
      console.log('aws event', data);
      if (!data.instance && data.state == 'error') {
        this.setState({ awsError: data.errorReason });
      } else if (!data.instance) {
        this.setState({ awsState: data.state });
      }
    };

    socket.on('aws', this.onAWS);
  }

  componentWillUnmount() {
    socket.off('aws', this.onAWS);
  }

  fetchInstances() {
    var key = settings.get('awsKey');
    var secret = settings.get('awsSecret');
    var region = settings.get('awsRegion');

    if (!key || !secret) {
      return;
    }

    http.post(
      config.api + '/aws/credentials',
      {
        key: key,
        secret: secret,
        region: region,
      }
    ).then(() => {
      return http.get(
        config.api + '/aws/list'
      )
    }).then((instances) => {
      console.log('instances', instances);
      if (instances.error) {
        this.setState({
          awsError: 'error getting instances, check credentials',
        });
      } else {
        this.setState({
          instances: instances,
          hasCredentials: true,
        });
      }
    });
  }

  openSettings() {
    this.setState({ showSettings: true });
  }

  closeSettings() {
    this.setState({ showSettings: false });
  }

  refreshInstances() {
    this.componentWillMount();
  }

  launchInstance() {
    var key = settings.get('awsKey');
    var secret = settings.get('awsSecret');
    var region = settings.get('awsRegion');

    if (!key || !secret) {
      return;
    }

    http.post(
      config.api + '/aws/credentials',
      {
        key: key,
        secret: secret,
      }
    ).then(() => {
      return http.post(
        config.api + '/aws/launch',
        {
          ami: 'ami-9c3b62ef', //'ami-68035c1b', //'ami-f6c89585', //'ami-2b86d458',
          instanceType: 't2.micro',
        }
      );
    }).then((response) => {
      console.log(response);
      this.refreshInstances();
    });;

  }

  render() {
    return <div>
      <div className='aws-instances-title'>
        <div className='aws-instances-refresh btn btn-link' onClick={()=>this.refreshInstances()}>
          <i className='ion-refresh'></i>
        </div>
        AWS Instances
      </div>
      { this.state.hasCredentials ?
      <AwsInstancesList
        instances={this.state.instances}
        onChange={() => this.refreshInstances()} />
      : <div>No AWS credentials set.

          <div className='btn btn-primary' onClick={()=>this.openSettings()}>Settings</div>
          {this.state.showSettings?<SettingsView onClose={()=>this.closeSettings()}/>:null}
        </div>
      }
      {this.state.awsError}
      {this.state.awsState}
      <button className='btn btn-link add-machine' onClick={() => this.launchInstance()}><i className="ion-plus"></i> launch instance</button>
    </div>
  }
}
