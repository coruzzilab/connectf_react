/**
 * @author zacharyjuang
 * 11/9/18
 */
import React from "react";
import {SortButton} from "../common";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import _ from "lodash";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";

export class ColHeader extends React.Component {
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
    let {colSpan, data, sorted, ascending, sortFunc, sortable} = this.props;

    return <th colSpan={colSpan}>
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col">
            <a className="text-primary link" onClick={this.showModal.bind(this)}>{this.props.children}</a>
          </div>
          {sortable ?
            <div className="col-1" style={{cursor: 'pointer'}}>
              <SortButton sortFunc={sortFunc} ascending={ascending} sorted={sorted}/>
            </div> :
            null}
        </div>
      </div>


      <Modal isOpen={visible} toggle={this.hideModal.bind(this)}>
        <ModalHeader toggle={this.hideModal.bind(this)}>
          Meta Data
        </ModalHeader>
        <ModalBody>
          <div className="table-responsive">
            <table className="table table-sm">
              <tbody>
              {_(data).map((val, key) => {
                return <tr key={key}>
                  <th>{key}</th>
                  <td>{val}</td>
                </tr>;
              }).value()}
              </tbody>
            </table>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button onClick={this.hideModal.bind(this)}><FontAwesomeIcon icon="times" className="mr-1"/>Close</Button>
        </ModalFooter>
      </Modal>
    </th>;
  }
}

ColHeader.propTypes = {
  colSpan: PropTypes.number,
  name: PropTypes.string,
  data: PropTypes.object,
  children: PropTypes.node,
  sortable: PropTypes.bool,
  sortFunc: PropTypes.func,
  sorted: PropTypes.bool,
  ascending: PropTypes.bool
};

ColHeader.defaultProps = {
  sortable: true,
  colSpan: 1,
  sorted: false,
  ascending: true
};
