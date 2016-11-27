var machines = [];

export default {
  set: (newMachines) => {
    machines.splice(0);
    machines.push(...newMachines);
  },

  get: () => machines,
};
