import React from 'react';
import settings from './localSettings';

export default class SettingsTab extends React.Component {
  save() {
    settings.set('awsKey', this.key.value);
    settings.set('awsSecret', this.secret.value);
    settings.set('awsRegion', this.region.value);
  }

  render() {
    return <div role="tabpanel" className="tab-pane" id="settings">
        <div className='row'>
          <div className='col-xs-12'>
            <h1>AWS</h1>
            <input className='form-control' placeholder='aws key id' defaultValue={settings.get('awsKey')} ref={v => this.key = v} />
            <input className='form-control' placeholder='aws secret' defaultValue={settings.get('awsSecret')} ref={v => this.secret = v} />
            <input className='form-control' placeholder='aws region' defaultValue={settings.get('awsRegion')} ref={v => this.region = v} />
            <div className='btn btn-primary' onClick={() => this.save() }>Save</div>
          </div>
        </div>
      </div>;
  }
}
