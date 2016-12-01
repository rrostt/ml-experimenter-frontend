import React from 'react';
import config from './config';
import http from './http';
import socket from './socket';

export default class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
    };
  }

  submit(e) {
    e.preventDefault();

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
      if (response.error) {
        this.setState({
          error: response.error,
        });
      } else if (response.accessToken) {
        localStorage.accessToken = response.accessToken;
        socket.emit('ui-connected', localStorage.accessToken);
        this.props.onLogin();
      }
    });

    return false;
  }

  render() {
    return <div className='container'>
      <div className='row'>
        <div className='col-xs-4 col-xs-offset-4' style={{ marginTop: 200 }}>
          <form onSubmit={(e) => this.submit(e)}>
            <input className='form-control' placeholder='login' ref={input => this.login = input} />
            <input className='form-control' placeholder='password' type='password' ref={input => this.password = input} />
            <button type='submit' className='btn btn-primary'>Login</button>
            {this.state.error}
          </form>
        </div>
      </div>
    </div>;
  }
}
