import React from 'react';

import DropZone from 'react-dropzone';

import FileItem from './fileItem';

export default class FilesColumn extends React.Component {
  render() {
    var dropZoneStyle = {
      width: '100%',
      height: 100,
      borderWidth: 2,
      borderColor: '#666',
      borderStyle: 'dashed',
      borderRadius: 5,
    };

    var containerStyle = {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
    };

    return <div style={containerStyle}>
        <div className='files-title'>Files</div>
        <div className='files'>
          { this.props.files.map((file, i) =>
            <FileItem key={i} file={file} onClick={() => this.props.fileClicked(file)}/>
          )}
        </div>
        <DropZone style={dropZoneStyle} onDrop={(files) => this.props.onDrop(files)}>
          Drop file or click to select file to upload.
        </DropZone>
        <div className='files-controls'>
          <div onClick={() => this.props.addFile()} className='btn btn-link files-add'>
            <i className='ion-plus'></i>
          </div>
        </div>
      </div>;
  }
}
