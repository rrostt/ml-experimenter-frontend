import React from 'react';
import CodeEditor from './code-editor';
import MachinesList from './machines-list';
import FilesColumn from './tabs/editor/files-column';

import { DropdownButton, MenuItem, ButtonToolbar } from 'react-bootstrap';

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
    this.loadCurrentProject();
  }

  startLoading() {
    this.setState({
      showLoadingModal: true,
    });
  }

  stopLoading() {
    this.setState({
      showLoadingModal: false,
    });
  }

  loadCurrentProject() {
    http.get('/projects/load/__current')
    .then(project => {
      this.setState({
        project: project,
      });
      this.loadFiles();
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

    if (!name) return;

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

        this.loadCurrentProject();
      });
  }

  loadProject(project) {
    this.setState({
      showProjectsList: false,
    });
    this.startLoading();

    http.get('/projects/load/' + project.name)
    .then(project => {
      console.log(project);
      this.loadFiles();
      this.setState({
        project: project,
        activeFile: { name: undefined, content: undefined },
      });
      this.stopLoading();
    }, () => {
      this.stopLoading();
    });
  }

  renameProject() {
    var newName = prompt('Rename?', this.state.project.name);

    if (!newName || newName === this.state.project.name) {
      return;
    }

    if (!(/^[A-Za-z0-9_\.-]*$/.test(newName))) {
      alert('invalid project name, must pass /^[A-Za-z0-9_.-]*$/');
      return;
    }

    http.post(
      '/projects/rename/' + this.state.project.name,
      {
        newName: newName,
      }
    ).then((response) => {
      if (response.error) {
        alert(response.error);
        return;
      }

      var project = Object.assign({}, this.state.project);
      project.name = newName;
      this.setState({
        project: project,
      });
    });
  }

  deleteProject() {
    http.post(
      '/projects/delete/' + this.state.project.name,
      {}
    ).then((response) => {
      if (response.error) return;

      this.setState({
        project: null,
      });
    });
  }

  cloneGit() {
    var url = prompt('git url');

    if (!url) return;

    this.startLoading();
    http.post(
      '/projects/git-clone',
      {
        url: url,
      }
    ).then((response) => {
      this.stopLoading();

      if (response.error) {
        console.log('error cloning git', response.error);
        alert(response.error);
        return;
      }

      this.loadCurrentProject();
    }, (err) => {
      this.stopLoading();
      console.log('error cloning', err);
      alert('network error');
    });
  }

  onDrop(files) {
    console.log(files);

    http.postFiles('/file/upload', files)
    .then(response => {
      console.log(response);
      this.loadFiles();
    }, err => console.log(err));
  }

  modalClosed() {
    this.setState({
      showProjectsList: false,
    });
  }

  onMachineSelected() {
    $('.nav-tabs a[href="#machines"]').tab('show');
  }

  render() {
    var filesListOverlay = <Modal title='Projects' onClose={() => this.modalClosed()}>
      <div className='list-group'>
        {this.state.projects.map(
          p => <a href='#' className='list-group-item' key={p.name} onClick={()=>this.loadProject(p)}>{p.name}</a>
        )}
      </div>
    </Modal>;

    var projectTitle = (this.state.project && this.state.project.name) || 'Project';

    return <div role="tabpanel" className="tab-pane active editor" id="code">
      <div className='row'>
        <div className='col-xs-2 files-column'>
          <ButtonToolbar>
            <DropdownButton bsStyle='link' title={projectTitle} id='projectdropdown'>
              <MenuItem onClick={() => this.newProject()}>New Project</MenuItem>
              <MenuItem onClick={() => this.listProject()}>Load Project</MenuItem>
              <MenuItem onClick={() => this.cloneGit()}>Clone Git repo</MenuItem>
              { this.state.project ? <MenuItem divider /> : null }
              { this.state.project ? <MenuItem onClick={() => this.renameProject()}>Rename Project</MenuItem> : null }
              { this.state.project ? <MenuItem onClick={() => this.deleteProject()}>Delete Project</MenuItem> : null }
            </DropdownButton>
          </ButtonToolbar>
          { this.state.project ?
            <FilesColumn
              files={this.state.files}
              fileClicked={(file) => this.fileClicked(file)}
              addFile={() => this.addFile()}
              onDrop={(files) => this.onDrop(files)}
              />
            : null
          }
        </div>
        <div className='col-xs-8 code-column'>
          { this.state.project ?
            <CodeEditor file={this.state.activeFile}
              onChange={(name, content) => this.save(name, content)}
              onRename={() => this.rename(this.state.activeFile)}
              onDelete={() => this.delete(this.state.activeFile)}
            />
          : null }
        </div>
        <div className='col-xs-2'>
          <div className='machines-title'>Machines</div>
          <MachinesList
            onSelected={(machine) => this.onMachineSelected(machine)}
            activeFilename={this.state.activeFile.name}/>
        </div>
      </div>
      {this.state.showProjectsList ? filesListOverlay : null}
      {this.state.showLoadingModal ? <Modal><h1>loading</h1></Modal> : null}
    </div>;
  }
}

module.exports = EditorTab;
