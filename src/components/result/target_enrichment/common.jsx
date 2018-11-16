/**
 * @author zacharyjuang
 * 11/9/18
 */
import _ from "lodash";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {tableToCsvUri} from "./utils";

export const TargetEnrichmentWarning = () => (
  <div className="text-danger text-lg-left text-sm-center">Target Enrichment is not available for this query: No
    gene list uploaded or no enrichment.</div>);

export const Export = ({table}) => {
  return <div className="container-fluid">
    <div className="row mt-2">
      <div className="col">
        <a className="btn btn-primary" href={"data:text/csv," + tableToCsvUri(table)}
           download="target_enrichment_table.csv">
          Table Data<FontAwesomeIcon icon="file-csv" className="ml-2"/></a>
        <p>P-values of enriched Target Gene Lists in a CSV format.</p>
      </div>
    </div>
  </div>;
};

Export.propTypes = {
  table: PropTypes.object.isRequired
};

export class RowHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  showModal(visible = true) {
    this.setState({
      visible
    });
  }

  render() {
    let {visible} = this.state;
    let {info} = this.props;

    return <th>
      <a className="text-primary link" onClick={this.showModal.bind(this, undefined)}>{this.props.children}</a>
      <Modal isOpen={visible} toggle={this.showModal.bind(this, false)}>
        <ModalHeader toggle={this.showModal.bind(this, false)}>{info.name}</ModalHeader>
        <ModalBody>
          {_.map(info, (val, key) => {
            return <p key={key}>{key}: {val}</p>;
          })}
        </ModalBody>
        <ModalFooter>
          <Button onClick={this.showModal.bind(this, false)}><FontAwesomeIcon icon="times"/> Close</Button>
        </ModalFooter>
      </Modal>
    </th>;
  }
}

RowHeader.propTypes = {
  info: PropTypes.object.isRequired,
  children: PropTypes.node
};
