import React from 'react';
import MachineListItem from './machine-list-item';
import socket from './socket';
import http from './http';
import machinesService from './services/machines';

export default class MachinesList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      machines: [],
      selectedMachine: null,
    };
  }

  componentWillMount() {
    machinesService.registerComponent(this);
  }

  componentWillUnmount() {
    machinesService.unregisterComponent(this);
  }

  machineClicked(machine) {
    if (this.props.onSelected) {
      this.props.onSelected(machine);
    }

    // this.setState({
    //   selectedMachine: machine,
    // });
    machinesService.setSelectedMachine(machine);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.state.selectedMachine !== nextState.selectedMachine && !!nextState.selectedMachine) {
      if (this.props.onSelected) {
        this.props.onSelected(nextState.selectedMachine);
      }
    }
  }

  onRename(machine, newName) {
    machine.name = newName;
    machinesService.setMachine(machine);

    http.post(
      '/machines/' + machine.id + '/rename',
      {
        newName: newName,
      }
    ).then((result) => {
      console.log('renamed');
    });
  }

  connect() {
    var host = prompt('hostname');

    if (!host) return;

    http.post(
      '/machines/connect',
      {
        host: host,
      }
    ).then(() => {
      console.log('connect sent');
    },

    err => {
      console.log('error', err);
    });
  }

  render() {
    return <div className='machines'>
      {this.state.machines.map(
        machine => <MachineListItem
          key={machine.id}
          selected={machine == this.state.selectedMachine}
          onClick={() => this.machineClicked(machine)}
          machine={machine}
          activeFilename={this.props.activeFilename}
          onRename={name => this.onRename(machine, name)}
        />
      )}
    </div>;
  }
}
