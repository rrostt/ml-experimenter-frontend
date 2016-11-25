import React from 'react';
import ReactDOM from 'react-dom';
import FileItem from './fileItem';
import CodeEditor from './code-editor';
import MachinesList from './machines-list';
import config from './config';
import http from './http';

import { validFilename } from './helpers';

class EditorTab extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      activeFile: {
        name: '',
        content: '',
      },
    };
  }

  componentWillMount() {
    this.loadFiles();
  }

  loadFiles() {
    http.get(config.api + '/files').then(response => {
      this.setState({ files: response });
    });
  }

  fileClicked(file) {
    console.log('file clicked', file);

    http.get(
      config.api + '/file',
      { name: file.name }
    ).then(content => {
      this.setState({
        activeFile: {
          name: file.name,
          content: content,
        },
      });
    });
  }

  rename(file) {
    var filename = file.name;
    var newFilename = prompt('Rename file ' + filename + ' to', filename);

    if (!validFilename(newFilename)) {
      alert('invalid filename');
      return;
    }

    http.post(
      config.api + '/file/mv',
      {
        from: filename,
        to: newFilename,
      }
    ).then((response) => {
      if (response.error) {
        alert(response.error);
      } else {
        // loadFiles();
        // loadFile({ name: newFilename });
        this.loadFiles();
        this.setState({
          activeFile: {
            name: newFilename,
            content: this.state.activeFile.content,
          },
        });
      }
    });
  }

  delete(file) {
    var filename = file.name;

    var confirmed = confirm('Delete file ' + filename);

    if (!confirmed) { return; }

    http.post(
      config.api + '/file/rm',
      {
        name: filename,
      }
    ).then((response) => {
      if (response.error) {
        alert(response.error);
      } else {
        this.loadFiles();
        this.setState({
          activeFile: { name: undefined, content: undefined },
        });
      }
    });
  }

  addFile() {
    var name = prompt('filename');

    if (!validFilename(name)) {
      alert('not a valid filename');
      return;
    }

    http.post(
      config.api + '/file/add',
      {
        name: name,
      }
    ).then((response) => {
      if (response.error) {
        alert(response.error);
      } else {
        this.loadFiles();
      }
    });
  }

  render() {
    return <div role="tabpanel" className="tab-pane active editor" id="code">
      <div className='row'>
        <div className='col-xs-2 files-column'>
          <div className='files-title'>Files column</div>
          <div className='files'>
            {this.state.files.map((file, i) => <FileItem key={i} file={file} onClick={() => this.fileClicked(file)}/>)}
          </div>
          <div className='files-controls'>
            <div onClick={() => this.addFile()} className='btn btn-link files-add'><i className='ion-plus'></i></div>
          </div>
        </div>
        <div className='col-xs-8 code-column'>
          <CodeEditor file={this.state.activeFile}
            onRename={() => this.rename(this.state.activeFile)}
            onDelete={() => this.delete(this.state.activeFile)}
          />
        </div>
        <div className='col-xs-2'>
          <div className='machines-title'>Machines</div>
          <MachinesList activeFilename={this.state.activeFile.name}/>
        </div>
      </div>
    </div>;
  }
}

module.exports = EditorTab;
