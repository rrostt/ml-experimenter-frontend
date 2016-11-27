import React from 'react';
import settings from './localSettings';
import http from './http';

export default class SettingsTab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      settings: {},
    };
  }

  componentWillMount() {
    http.get('/settings').then(settings => {
      console.log('settings', settings);
      this.setState({ settings: settings });
    });
  }

  save() {
    http.post(
      '/settings/',
      {
        settings: JSON.stringify(this.state.settings),
      }
    );
  }

  onChange(e) {
    console.log(e.target);

    var settings = Object.assign({}, this.state.settings);
    settings[$(e.target).data('key')] = e.target.value;
    this.setState({ settings: settings });
    console.log(settings);
  }

  render() {
    return <div role="tabpanel" className="tab-pane" id="settings">
        <div className='row'>
          <div className='col-xs-12'>
            <h1>AWS</h1>
            <input type='text' data-key='awsKey' className='form-control' placeholder='aws key id' value={this.state.settings.awsKey || ''} onChange={(e) => this.onChange(e)} />
            <input type='text' data-key='awsSecret' className='form-control' placeholder='aws secret' value={this.state.settings.awsSecret || ''} onChange={(e) => this.onChange(e)} />
            <input type='text' data-key='awsRegion' className='form-control' placeholder='aws region' value={this.state.settings.awsRegion || ''} onChange={(e) => this.onChange(e)} />
            <div className='btn btn-primary' onClick={() => this.save() }>Save</div>
          </div>
        </div>
      </div>;
  }
}
