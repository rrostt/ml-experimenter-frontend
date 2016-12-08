import React from 'react';

import { DropdownButton, MenuItem, ButtonToolbar } from 'react-bootstrap';
import Modal from './modal';

import config from './config';
import socket from './socket';
import http from './http';

export default class MachineListItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showConfig: false,
    };
  }

  syncAndRun(e) {
    e.preventDefault();
    e.stopPropagation();

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
    e.preventDefault();
    e.stopPropagation();

    http.get(config.api + '/machines/' + this.props.machine.id + '/stop');
  }

  rename() {
    var newName = prompt('Change name', this.props.machine.name || this.props.machine.id);

    if (newName) {
      this.props.onRename && this.props.onRename(newName);
    }
  }

  showConfig() {
    this.setState({
      showConfig: true,
    });
  }

  closeConfig() {
    this.setState({
      showConfig: false,
    });
  }

  onClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
    }
  }

  render() {
    var className = this.props.selected ? 'client-control selected' : 'client-control';
    return <div className={className} onClick={this.onClick.bind(this)}>
      <DropdownButton style={{ float: 'right' }} className='close' bsStyle='link' noCaret title='...' id='machinedropdown'>
        <MenuItem onClick={() => this.rename()}>Rename</MenuItem>
        <MenuItem onClick={() => this.showConfig()}>Configuration</MenuItem>
      </DropdownButton>
      <div className="client-id">{this.props.machine.name || this.props.machine.id}</div>
      { this.props.machine.syncStatus === 'syncing' ?
        'syncing...'
        :
        this.props.machine.runStatus === 'idle' ?
        <div className="btn btn-link run" onClick={(e) => this.syncAndRun(e)}>
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

      { this.state.showConfig ?
        <Modal
          title='Machine configuration'
          onClose={() => this.closeConfig()}
          >
          hello
        </Modal>
      : null
      }
    </div>;
  }
}
