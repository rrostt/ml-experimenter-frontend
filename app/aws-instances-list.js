import React from 'react';
import ReactDOM from 'react-dom';

import AwsInstanceItem from './aws-instance-item';

export default class AwsInstancesList extends React.Component {
  render() {
    return <div className='aws-instances'>
      {
        this.props.instances.map(
          instance => <AwsInstanceItem
            key={instance.instanceId}
            instance={instance}
            onChange={this.props.onChange} />
        )
      }
    </div>;
  }
}
