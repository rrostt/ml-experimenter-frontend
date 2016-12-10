class SharedResource {
  init() {}
  deinit() {}
  getState() { return {}; }

  registerComponent(component) {
    this.components.push(component);

    if (this.components.length === 1) {
      this.init();
    } else {
      component.setState(this.getState());
    }
  }

  unregisterComponent(component) {
    var i = this.components.indexOf(component);
    if (i !== -1) {
      this.components.splice(i, 1);
    }

    if (this.components.length === 0) {
      this.deinit();
    }
  }

  setStates() {
    var state = this.getState();
    this.components.forEach(component => {
      component.setState(state);
    });
  }
}

export default SharedResource;
