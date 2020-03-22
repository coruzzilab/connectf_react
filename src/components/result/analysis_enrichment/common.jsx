/**
 * @author zacharyjuang
 * 9/19/18
 */
import React from "react";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import _ from "lodash";
import PropTypes from "prop-types";

export class RowHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };

    this.toggle = this.toggle.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  render() {
    let {children, info} = this.props;

    return <th>
      <span onClick={this.toggle} className="link text-primary">{children}</span>
      <Modal key={1} isOpen={this.state.modal} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>Genes</ModalHeader>
        <ModalBody>
          <div className="table-responsive">
            <table className="table">
              <tbody>
              <tr>
                <th>Name</th>
                <td>{info[0][0]}</td>
              </tr>
              <tr>
                <th>Filter</th>
                <td>{info[0][1]}</td>
              </tr>
              {_.map(info[1], (val, key) => {
                return <tr key={key}>
                  <th>{key}</th>
                  <td>{val}</td>
                </tr>;
              })}
              </tbody>
            </table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color="primary" onClick={this.toggle} className="mr-1">Close</Button>
        </ModalFooter>
      </Modal>
    </th>;
  }
}

RowHeader.propTypes = {
  children: PropTypes.node,
  info: PropTypes.array.isRequired
};
