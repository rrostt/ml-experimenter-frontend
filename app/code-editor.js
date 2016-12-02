import React from 'react';
import ReactDOM from 'react-dom';

import { DropdownButton, MenuItem, ButtonToolbar } from 'react-bootstrap';

import http from './http';
import config from './config';

class CodeEditor extends React.Component {
  componentDidUpdate() {
    if (!this.codemirror) {
      var $codeTextArea = $('.code', $(ReactDOM.findDOMNode(this)));
      if ($codeTextArea.length == 0) { return; }

      var width = $codeTextArea.parent().width();
      var height = $codeTextArea.height();
      this.codemirror = CodeMirror.fromTextArea($codeTextArea[0],
        {
          lineNumbers: true,
          viewportMargin: Infinity,
        }
      );
      this.codemirror.setSize(width, height);

      this.codemirror.on('blur', () => {
        var input = this.codemirror.getValue();
        var name = this.props.file.name;

        if (!name) { return; }

        if (this.props.onChange) {
          this.props.onChange(name, input);
        }
      });
    } else if ($('.code', $(ReactDOM.findDOMNode(this))).length === 0) {
      this.codemirror = undefined;
    }

    if (this.props.file.name !== '' && !!this.codemirror) {
      this.codemirror.setValue(this.props.file.content);
    }
  }

  componentDidMount() {
    console.log('did mount');
  }

  rename() {
    console.log('rename');

    this.props.onRename();
  }

  delete() {
    console.log('delete');

    this.props.onDelete();
  }

  render() {
    var containerStyle = {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #ddd',
      borderRadius: 3,
    };

    var headerStyle = {
      padding: '5px 10px',
      backgroundColor: '#f7f7f7',
      borderBottom: '1px solid #d8d8d8',
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
    };

    if (!!this.props.file.name && this.props.file.name != '') {
      return <div style={containerStyle}>
        <div style={headerStyle}>
          <DropdownButton bsStyle='link' title={this.props.file.name} id='filedropdown'>
            <MenuItem onClick={() => this.rename()}>Rename file</MenuItem>
            <MenuItem onClick={() => this.delete()}>Delete file</MenuItem>
          </DropdownButton>
        </div>
        <textarea className='form-control code'></textarea>
      </div>;
    } else {
      return <div style={{ margin: '5px auto', padding: 10 }}>
        no file selected
      </div>;
    }
  }
}

module.exports = CodeEditor;
