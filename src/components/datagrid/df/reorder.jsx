/**
 * @author zacharyjuang
 */
import React from 'react';
import {Modal, Button} from 'react-bootstrap';

class Reorder extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  showModal() {
    this.setState({
      visible: true
    });
  }

  hideModal() {
    this.setState({
      visible: false
    });
  }

  render() {
    let {visible} = this.state;

    return <div style={{float: 'left'}}>
      <Button onClick={this.showModal.bind(this)}>Multi-column Sort</Button>
      <Modal show={visible} onHide={this.hideModal.bind(this)}>
        <Modal.Header closeButton>
          <Modal.Title>Multi-column Sort</Modal.Title>
        </Modal.Header>
        <Modal.Body>Riveting Content!</Modal.Body>
        <Modal.Footer>
          <Button onClick={this.hideModal.bind(this)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </div>;
  }
}

export default Reorder;
