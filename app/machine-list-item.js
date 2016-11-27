import React from 'react';
import config from './config';
import http from './http';

export default class MachineListItem extends React.Component {
  sync() {
    http.get(config.api + '/machines/' + this.props.machine.id + '/sync');
  }

  run() {
    http.get(
      config.api + '/machines/' + this.props.machine.id + '/run',
      { file: this.props.activeFilename }
    );
  }

  stop() {
    http.get(config.api + '/machines/' + this.props.machine.id + '/stop');
  }

  onClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  render() {
    var className = this.props.selected ? 'client-control selected' : 'client-control';
    return <div className={className} onClick={this.onClick.bind(this)}>
      <div className="client-id">{this.props.machine.id}</div>
      { this.props.machine.syncStatus !== 'syncing' ?
        <div className="btn btn-link sync" onClick={() => this.sync()}>
          <i className="ion-code-download"></i>
        </div>
        :
        <div className="btn btn-link sync">
          <i className="ion-code-download"></i> syncing
        </div>
      }
      { this.props.machine.runStatus == 'idle' ?
        <div className="btn btn-link run" onClick={() => this.run()}><i className="ion-play"></i></div>
        :
        <div className="btn btn-link stop" onClick={() => this.stop()}><i className="ion-stop"></i></div>
      }
      { this.props.machine.syncStatus === 'error' ? 'error syncing' : '' }
      <div>
        <pre className="stdout">{this.props.machine.stdout}</pre>
        <pre className="stderr">{this.props.machine.stderr}</pre>
      </div>
    </div>;
  }
}
