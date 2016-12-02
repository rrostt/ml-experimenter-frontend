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

      var width = $codeTextArea.width();
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
    if (!!this.props.file.name && this.props.file.name != '') {
      return <div style={{ height: '100%', display: 'flex', flexDirection: 'column', }}>
        <DropdownButton bsStyle='link' title={this.props.file.name} id='filedropdown'>
          <MenuItem onClick={() => this.rename()}>Rename file</MenuItem>
          <MenuItem onClick={() => this.delete()}>Delete file</MenuItem>
        </DropdownButton>
        <textarea className='form-control code'></textarea>
      </div>;
    } else {
      return <div>
        no file selected
      </div>;
    }
  }
}

module.exports = CodeEditor;
