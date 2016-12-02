import React from 'react';
import config from './config';
import socket from './socket';
import http from './http';

export default class MachineListItem extends React.Component {
  syncAndRun() {
    this.onMachineStateSync = (state) => {
      if (state.id !== this.props.machine.id) {
        return;
      }

      if (state.syncStatus === 'success') {
        http.get(
          config.api + '/machines/' + this.props.machine.id + '/run',
          { file: this.props.activeFilename }
        );
        socket.off('machine-state', this.onMachineStateSync);
      } else if (state.syncStatus === 'error') {
        socket.off('machine-state', this.onMachineStateSync);
      }
    };

    http.get(config.api + '/machines/' + this.props.machine.id + '/sync')
    .then(() => {
      socket.on('machine-state', this.onMachineStateSync);
    });
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
      { this.props.machine.syncStatus === 'syncing' ?
        'syncing...'
        :
        this.props.machine.runStatus === 'idle' ?
        <div className="btn btn-link run" onClick={() => this.syncAndRun()}>
          <i className="ion-play"></i> go
        </div>
        :
        <div className="btn btn-link stop" onClick={() => this.stop()}>
          <i className="ion-stop"></i>
        </div>
      }
      { this.props.machine.syncStatus === 'error' ? 'error syncing' : '' }
      <div>
        <pre className="stdout">{this.props.machine.stdout}</pre>
        <pre className="stderr">{this.props.machine.stderr}</pre>
      </div>
    </div>;
  }
}
