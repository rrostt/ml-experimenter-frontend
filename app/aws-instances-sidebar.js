import React from 'react';
import ReactDOM from 'react-dom';
import AwsInstancesList from './aws-instances-list';
import Modal from './modal';

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
      showLaunchModal: false,
    };
  }

  componentWillMount() {
    this.fetchInstances();

    this.onAWS = (data) => {
      console.log('aws event', data);
      if (!data.instance && data.state == 'error') {
        if (data.details && data.details.message) {
          this.setState({ awsError: data.details.message });
        } else {
          this.setState({ awsError: data.errorReason });
        }
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

  onShowLaunchModalClose() {
    this.setState({
      showLaunchModal: false,
    });
  }

  launchInstanceNow() {
    var instanceType = this.refs.instanceType.value;
    var ami = this.refs.ami.value;

    this.setState({
      showLaunchModal: false,
    });

    http.post(
      config.api + '/aws/launch',
      {
        ami: ami, //'ami-953d64e6',
        instanceType: instanceType, // t2.micro
      }
    ).then((response) => {
      console.log(response);
      this.refreshInstances();
    });
  }

  launchInstance() {
    this.setState({
      showLaunchModal: true,
    });
  }

  onClickSettings(e) {
    $('.nav-tabs a[href="#settings"]').tab('show');
  }

  render() {
    var instanceTypes = [
      { name: 't2.micro', desc: '1gb, 1core' },
      { name: 'c4.large', desc: '3.75gb, 2core' },
      { name: 'p2.xlarge', desc: 'gpu' },
    ];

    var amis = [
      { name: 'ml-experimenter worker', ami: 'ami-953d64e6' },
      { name: 'ml-experimenter GPU worker', ami: 'ami-130a5260' },
    ];

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

      {
        this.state.showLaunchModal ?
        <Modal title='Launch AWS instance' onClose={() => this.onShowLaunchModalClose()}>
          <div className='form-group'>
            <label>AMI</label>
            <select className='form-control' ref='ami'>
              {amis.map(
                type => <option key={type.name} value={type.ami}>{type.name}</option>
              )}
            </select>
          </div>
          <div className='form-group'>
            <label>Instance type</label>
            <select className='form-control' ref='instanceType'>
              {instanceTypes.map(
                type => <option key={type.name} value={type.name}>{type.name} - {type.desc}</option>
              )}
            </select>
          </div>
          <div className='button-group'>
            <button className='btn btn-primary' onClick={() => this.launchInstanceNow()}>Launch</button>
          </div>
        </Modal>
        :
        null
      }
    </div>;
  }
}
