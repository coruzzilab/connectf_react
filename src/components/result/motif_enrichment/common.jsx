/**
 * @author zacharyjuang
 * 11/9/18
 */
import React from "react";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledTooltip} from "reactstrap";
import _ from "lodash";
import {FontAwesomeIcon as Icon, FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import classNames from "classnames";

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
    let {colSpan, data} = this.props;

    return <th colSpan={colSpan}>
      <div className="container-fluid">
        <div className="row align-items-center">
          <div className="col">
            <a className="text-primary link" onClick={this.showModal.bind(this)}>{this.props.children}</a>
          </div>
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

export const MotifEnrichmentInfo = () => {
  return <p className="text-secondary">
    Finding enriched motifs in the set of target genes in analyses. The counts of a motif in the Target genes of each
    analysis is compared to the total number of counts in the genome. Enrichment is calculated by the Fisher&apos;s
    Exact Test.
  </p>;
};

export const BASE_COLORS = {
  'a': '#59C83B',
  't': '#CC2B1D',
  'c': '#0012D3',
  'g': '#F5BD41',
  'other': '#888888'
};

export const MotifRegionCheckbox = ({name, data, checked, disabled, onChange}) => {
  let label = React.createRef();

  return <div className="form-check form-check-inline">
    <label className={classNames("form-check-label", disabled ? "text-muted" : null)} ref={label}>
      <input className="form-check-input"
             type="checkbox"
             value={name}
             checked={checked}
             disabled={disabled}
             onChange={onChange}/>
      {data.name}
    </label>
    <UncontrolledTooltip target={label} delay={0}>
      {data.description}
    </UncontrolledTooltip>
  </div>;
};

MotifRegionCheckbox.propTypes = {
  name: PropTypes.string,
  data: PropTypes.object,
  checked: PropTypes.bool,
  disabled: PropTypes.bool,
  onChange: PropTypes.func
};

export const BusyIcon = ({busy}) => {
  return busy ? <Icon icon="circle-notch" spin size="lg"/> : null;
};

BusyIcon.propTypes = {
  busy: PropTypes.bool
};
