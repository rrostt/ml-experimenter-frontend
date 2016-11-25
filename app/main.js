import React from 'react';
import ReactDOM from 'react-dom';
import DashBoard from './dashboard';
import Login from './login';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      authenticated: !!localStorage.accessToken,
    };
  }

  onLogin() {
    this.setState({
      authenticated: true,
    });
  }

  render() {
    if (this.state.authenticated) {
      return <DashBoard></DashBoard>;
    } else {
      return <Login onLogin={() => this.onLogin()}></Login>;
    }
  }
}

ReactDOM.render(<App/>, document.getElementById('app'));
