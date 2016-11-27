import React from 'react';
import MachineListItem from './machine-list-item';
import socket from './socket';
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
    // $.get(config.api + '/machines').then(machines => {
    //   this.setState({
    //     machines: machines,
    //   });
    // });

    this.onMachines = (machines) => {
      machinesService.set(machines);
      console.log('machines', machines);
      this.setState({
        machines: machines,
      });
    };

    socket.on('machines', this.onMachines);

    this.onMachineState = state => {
      var machine = this.state.machines.find(machine => machine.id === state.id);
      if (machine) {
        Object.assign(machine, state);
        this.setState({ machines: this.state.machines.slice() });
      }
    };

    socket.on('machine-state', this.onMachineState);
  }

  componentWillUnmount() {
    socket.off('machines', this.onMachines);
    socket.off('machine-state', this.onMachineState);
  }

  machineClicked(machine) {
    if (this.props.onSelected) {
      this.props.onSelected(machine);
    }

    this.setState({
      selectedMachine: machine,
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
        />
      )}
    </div>;
  }
}
