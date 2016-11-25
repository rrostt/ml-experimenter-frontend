var settings = {};

if (localStorage.settings) {
  settings = JSON.parse(localStorage.settings);
}

export default {
  get: (key) => settings[key],
  set: (key, value) => {
    settings[key] = value,
    localStorage.settings = JSON.stringify(settings);
    return value;
  },
};
