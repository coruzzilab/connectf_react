/**
 * @author zacharyjuang
 * 11/9/18
 */
import React, {useRef, useState} from "react";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, UncontrolledTooltip} from "reactstrap";
import _ from "lodash";
import {FontAwesomeIcon as Icon, FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import classNames from "classnames";
import {BASE_URL} from "../../../utils/axios_instance";

export const ColHeader = ({colSpan, data, children}) => {
  let [visible, setVisible] = useState(false);

  const toggle = () => {
    setVisible(!visible);
  };

  return <th colSpan={colSpan} onClick={toggle} className="p-0">
    <div className="container-fluid my-1" onClick={toggle}>
      {children}
    </div>

    <Modal isOpen={visible} toggle={toggle}>
      <ModalHeader toggle={toggle}>
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
        <Button onClick={toggle}><FontAwesomeIcon icon="times" className="mr-1"/>Close</Button>
      </ModalFooter>
    </Modal>
  </th>;
};

ColHeader.propTypes = {
  colSpan: PropTypes.number,
  data: PropTypes.object.isRequired,
  children: PropTypes.node
};

ColHeader.defaultProps = {
  colSpan: 1
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
  let label = useRef(null);

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
  busy: PropTypes.oneOfType([PropTypes.bool, PropTypes.number])
};

export const ExportClusterInfo = ({className}) => {
  return <a href={new URL('/api/motif_enrichment/cluster_info.csv', BASE_URL)}
            className={classNames("btn btn-primary", className)}>
    <Icon icon="file-csv" className="mr-1"/>Export Cluster Information</a>;
};

ExportClusterInfo.propTypes = {
  className: PropTypes.string
};

export function makeLines(data) {
  let line1 = data.name, line2;
  if (data['gene_name']) {
    line1 += ` (${data['gene_name']})`;
  }

  if (data['label']) {
    line2 = data['label'];
  } else {
    line2 = _(data).pick(['TECHNOLOGY', 'ANALYSIS_METHOD', 'ANALYSIS_CUTOFF']).values().join('-');
  }

  return [line1, line2];
}
