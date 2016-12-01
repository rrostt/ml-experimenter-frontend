import React from 'react';
import ReactDOM from 'react-dom';
import AwsInstancesList from './aws-instances-list';

import config from './config';
import http from './http';
import socket from './socket';

export default class AwsInstancesSidebar extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasCredentials: false,
      instances: [],
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
    http.get(
      config.api + '/aws/list'
    ).then((instances) => {
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

  refreshInstances() {
    this.componentWillMount();
  }

  launchInstance() {
    http.post(
      config.api + '/aws/launch',
      {
        ami: 'ami-953d64e6',
        instanceType: 't2.micro',
      }
    ).then((response) => {
      console.log(response);
      this.refreshInstances();
    });;
  }

  onClickSettings(e) {
    $('.nav-tabs a[href="#settings"]').tab('show');
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

          <a href='#settings' role="tab" data-toggle="tab" onClick={(e) => this.onClickSettings(e)}>
            <div className='btn btn-primary'>Settings</div>
          </a>
        </div>
      }
      {this.state.awsError}
      {this.state.awsState}
      <button className='btn btn-link add-machine' onClick={() => this.launchInstance()}><i className="ion-plus"></i> launch instance</button>
    </div>
  }
}
