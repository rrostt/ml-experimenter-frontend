import React from 'react';
import ReactDOM from 'react-dom';

import settings from './localSettings';

export default class Settings extends React.Component {
  save() {
    settings.set('awsKey', this.key.value);
    settings.set('awsSecret', this.secret.value);
    settings.set('awsRegion', this.region.value);

    this.props.onClose();
  }

  render() {
    return <div className='settings'>
        <input placeholder='aws key id' defaultValue={settings.get('awsKey')} ref={v => this.key = v} />
        <input placeholder='aws secret' defaultValue={settings.get('awsSecret')} ref={v => this.secret = v} />
        <input placeholder='aws region' defaultValue={settings.get('awsRegion')} ref={v => this.region = v} />
        <div className='btn btn-primary' onClick={() => this.save() }>Save</div>
      </div>;
  }
}
