import config from './config';

var socket = io(config.api, { secure: config.api.startsWith('https') });

export default socket;

socket.on('connect', function () {
  console.log('connected');
  if (localStorage.accessToken) {
    socket.emit('ui-connected', localStorage.accessToken);
  }
});

socket.on('disconnect', function () {
  console.log('user disconnected');
});
