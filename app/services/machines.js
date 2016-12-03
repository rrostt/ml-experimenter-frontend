import SharedResource from '../shared-resource';
import socket from '../socket';

class Machines extends SharedResource {
  constructor() {
    super();
    this.components = [];

    this.machines = [];
    this.selectedMachine = undefined;
  }

  setMachines(machines) {
    this.machines = machines;
    this.setStates();
  }

  getState() {
    return {
      machines: this.machines,
      selectedMachine: this.selectedMachine,
    };
  }

  init() {
    this.onMachines = (machines) => {
      console.log('machines', machines);
      this.setMachines(machines);
    };

    socket.on('machines', this.onMachines);

    this.onMachineState = state => {
      var machine = this.machines.find(machine => machine.id === state.id);
      if (machine) {
        Object.assign(machine, state);
        this.setMachines(this.machines.slice());
      }
    };

    socket.on('machine-state', this.onMachineState);
  }

  deinit() {
    socket.off('machines', this.onMachines);
    socket.off('machine-state', this.onMachineState);
  }

  setMachine(machine) {
    var existingMachine = this.machines.find(m => m.id === machine.id);
    if (existingMachine) {
      Object.assign(existingMachine, machine);
      this.setMachines(this.machines.slice());
    }
  }

  setSelectedMachine(machine) {
    this.selectedMachine = machine;
    this.setStates();
  }
}

export default new Machines();
