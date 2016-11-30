import React from 'react';
import ReactDOM from 'react-dom';
import FileItem from './fileItem';
import CodeEditor from './code-editor';
import MachinesList from './machines-list';

import DropZone from 'react-dropzone';

import Modal from './modal';
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

      project: {
        name: '',
      },
      projects: [],
      showProjectsList: false,
    };
  }

  componentWillMount() {
    this.loadFiles();
    this.loadCurrentProject();
  }

  loadCurrentProject() {
    http.get('/projects/load/__current')
    .then(project => {
      this.setState({
        project: project,
      });
    });
  }

  loadFiles() {
    http.get(config.api + '/files').then(response => {
      this.setState({ files: response });
    });
  }

  fileClicked(file) {
    console.log('file clicked', file);

    if (file.size > 2000000) {
      alert('file too big for editor');
      return;
    }

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

  save(name, content) {
    console.log('posting file');
    http.post('/file',
      {
        name: name,
        content: content,
      }
    ).then(() => {
      // still the same file?
      if (this.state.activeFile.name === name) {
        this.setState({
          activeFile: { name: name, content: content },
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

  listProject() {
    http.get('/projects').then(projects => {
      console.log(projects);

      this.setState({
        showProjectsList: true,
        projects: projects,
      });
    });
  }

  newProject() {
    http.get('/projects/new')
      .then(projects => {
        console.log(projects);

        this.loadProject();
        this.loadFiles();
      });
  }

  loadProject(project) {
    http.get('/projects/load/' + project.name)
    .then(project => {
      $('.modal', $(ReactDOM.findDOMNode(this))).modal('hide');
      console.log(project);
      this.loadFiles();
      this.setState({
        project: project,
        showProjectsList: false,
        activeFile: { name: undefined, content: undefined },
      });
    });
  }

  renameProject() {
    var newName = prompt('Rename?', this.state.project.name);

    if (!newName || newName === this.state.project.name) {
      return;
    }

    http.post(
      '/projects/rename/' + this.state.project.name,
      {
        newName: newName,
      }
    ).then((response) => {
      if (response.error) return;

      var project = Object.assign({}, this.state.project);
      project.name = newName;
      this.setState({
        project: project,
      });
    });
  }

  componentDidUpdate() {
    $('.modal', $(ReactDOM.findDOMNode(this))).modal({ backdrop: true });
  }

  onDrop(files) {
    console.log(files);

    http.postFiles('/file/upload', files)
    .then(response => {
      console.log(response);
      this.loadFiles();
    }, err => console.log(err));
  }

  render() {
    var dropZoneStyle = {
      width: '100%',
      height: 100,
      borderWidth: 2,
      borderColor: '#666',
      borderStyle: 'dashed',
      borderRadius: 5,
    };

    var filesListOverlay = <Modal title='Projects'>
      <div className='list-group'>
        {this.state.projects.map(
          p => <a href='#' className='list-group-item' key={p.name} onClick={()=>this.loadProject(p)}>{p.name}</a>
        )}
      </div>
    </Modal>;

    return <div role="tabpanel" className="tab-pane active editor" id="code">
      <div className='row projects-toolbar'>
        <div className='btn-toolbar' role='toolbar'>
          <div className='btn-group btn-group-sm' role='group'>
            <button className='btn btn-default' onClick={() => this.listProject()}>
              Load project
            </button>
            <button className='btn btn-default' onClick={() => this.newProject()}>
              New project
            </button>
            <span className='project-title'>{this.state.project.name}</span>
            <span className='project-title-rename' onClick={() => this.renameProject()}>rename</span>
          </div>
        </div>
      </div>
      <div className='row'>
        <div className='col-xs-2 files-column'>
          <div className='files-title'>Files column</div>
          <div className='files'>
            {this.state.files.map((file, i) => <FileItem key={i} file={file} onClick={() => this.fileClicked(file)}/>)}
          </div>
          <DropZone style={dropZoneStyle} onDrop={(files) => this.onDrop(files)}>
            Drop file or click to select file to upload.
          </DropZone>
          <div className='files-controls'>
            <div onClick={() => this.addFile()} className='btn btn-link files-add'><i className='ion-plus'></i></div>
          </div>
        </div>
        <div className='col-xs-8 code-column'>
          <CodeEditor file={this.state.activeFile}
            onChange={(name, content) => this.save(name, content)}
            onRename={() => this.rename(this.state.activeFile)}
            onDelete={() => this.delete(this.state.activeFile)}
          />
        </div>
        <div className='col-xs-2'>
          <div className='machines-title'>Machines</div>
          <MachinesList activeFilename={this.state.activeFile.name}/>
        </div>
      </div>
      {this.state.showProjectsList ? filesListOverlay : null}
    </div>;
  }
}

module.exports = EditorTab;
