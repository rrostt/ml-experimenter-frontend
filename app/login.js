import React from 'react';
import config from './config';
import http from './http';
import socket from './socket';

export default class Login extends React.Component {
  submit() {
    var login = this.login.value;
    var password = this.password.value;

    http.post(
      config.api + '/auth/login',
      {
        login: login,
        password: password,
      }
    ).then(response => {
      console.log(response);
      if (response.accessToken) {
        localStorage.accessToken = response.accessToken;
        socket.emit('ui-connected', localStorage.accessToken);
        this.props.onLogin();
      }
    });
  }

  render() {
    return <div>
      <input className='form-control' placeholder='login' ref={input => this.login = input} />
      <input className='form-control' placeholder='password' type='password' ref={input => this.password = input} />
      <button className='btn btn-primary' onClick={() => this.submit()}>Login</button>
    </div>;
  }
}
