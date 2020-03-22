/**
 * @author zacharyjuang
 * 11/9/18
 */
import _ from "lodash";
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import styled from "styled-components";
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

const FrozenTh = styled.th`
  position: sticky;
  left: 0px;
`;

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

    let geneId = _.get(info, 'gene_id');
    let geneName = _.get(info, 'gene_name');
    let name = geneId + (geneName ? ` (${geneName})` : '');

    return <FrozenTh className="p-0">
      <div className="w-100 h-100 bg-white border p-1 text-nowrap">
        <a className="text-primary link" onClick={this.showModal.bind(this, undefined)}>{this.props.children}</a>
      </div>
      <Modal isOpen={visible} toggle={this.showModal.bind(this, false)}>
        <ModalHeader toggle={this.showModal.bind(this, false)}>{name}</ModalHeader>
        <ModalBody>
          <div className="table-responsive">
            <table className="table">
              <tbody>
              {_.map(info, (val, key) => {
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
          <Button onClick={this.showModal.bind(this, false)}><FontAwesomeIcon icon="times"/> Close</Button>
        </ModalFooter>
      </Modal>
    </FrozenTh>;
  }
}

RowHeader.propTypes = {
  info: PropTypes.object.isRequired,
  children: PropTypes.node
};
