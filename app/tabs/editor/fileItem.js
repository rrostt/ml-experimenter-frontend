import React from 'react';

class FileItem extends React.Component {
  render() {
    return <div className='file' onClick={this.props.onClick}>{this.props.file.name}</div>
  }
}

module.exports = FileItem;
