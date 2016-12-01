import React from 'react';
import ReactDOM from 'react-dom';

export default class Modal extends React.Component {
  componentDidMount() {
    var params = {
      keyboard: false,
      backdrop: this.props.title ? true : 'static',
    };

    $(ReactDOM.findDOMNode(this)).modal(params);

    $(ReactDOM.findDOMNode(this)).on(
      'hidden.bs.modal',
      () => {
        if (this.props.onClose) this.props.onClose();
      }
    );
  }

  componentWillUnmount() {
    $(ReactDOM.findDOMNode(this)).modal('hide');
  }

  render() {
    var header = <div className="modal-header">
      <button type="button" className="close" data-dismiss="modal" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
      <h4 className="modal-title" id="exampleModalLabel">{this.props.title}</h4>
    </div>;

    var body = <div className='modal-body'>
      { this.props.children }
    </div>;

    return <div className='modal fade' role='dialog'>
      <div className='modal-dialog' role='document'>
        <div className='modal-content'>
          {this.props.title ? header : null}
          {body}
        </div>
      </div>
    </div>;
  }
}
