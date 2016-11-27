import React from 'react';
import ReactDOM from 'react-dom';
import EditorTab from './editor-tab';
import MachinesTab from './machines-tab';
import SettingsView from './settings-view';
import SettingsTab from './settings-tab';
import GraphTab from './graph-tab';

class DashBoard extends React.Component {
  componentDidMount() {
    $('.nav-tabs a', $(ReactDOM.findDOMNode(this))).click(function (e) {
      e.preventDefault();
      $(this).tab('show');
    });
  }

  logout() {
    localStorage.removeItem('accessToken');
    window.location.reload();
  }

  render() {
    return <div className='container-fluid app'>
      <div className='row'>
        <div className='col-xs-12'>
          <ul className='nav nav-tabs'>
            <li role='presentation' className='active'><a href='#code' role="tab" data-toggle="tab">Code</a></li>
            <li role='presentation'><a href='#machines' role="tab" data-toggle="tab">Machines</a></li>
            <li role='presentation'><a href='#graphs' role="tab" data-toggle="tab">Graphs</a></li>
            <li role='presentation'><a href='#settings' role="tab" data-toggle="tab">Settings</a></li>
            <li><a href='#' onClick={() => this.logout()}>Logout</a></li>
          </ul>
        </div>
      </div>
      <div className='tab-content'>
        <EditorTab></EditorTab>
        <MachinesTab></MachinesTab>
        <GraphTab></GraphTab>
        <SettingsTab></SettingsTab>
      </div>
    </div>;
  }
}

module.exports = DashBoard;
