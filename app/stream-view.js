import React from 'react';

export default class StreamView extends React.Component {
  onClear() {
    this.props.onClear && this.props.onClear();
  }

  render() {
    var containerStyle = {
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid #ddd',
      borderRadius: 3,
      marginTop: 5,
    };

    var headerStyle = {
      padding: '5px 10px',
      backgroundColor: '#f7f7f7',
      borderBottom: '1px solid #d8d8d8',
      borderTopLeftRadius: 2,
      borderTopRightRadius: 2,
      fontSize: 14,
    };

    var preStyle = {
      background: '#fff',
      border: 'none',
      height: '100%',
    };

    return <div style={containerStyle}>
      <div style={headerStyle}>
        stdout <span className='clear' onClick={() => this.onClear()}>clear</span>
      </div>
      <pre style={preStyle}>{this.props.content}</pre>
    </div>;
  }
}
