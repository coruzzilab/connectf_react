/**
 * @author zacharyjuang
 * 9/19/18
 */
import React from "react";
import classNames from "classnames";
import _ from "lodash";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {blobFromString} from "../../../utils";
import styled from "styled-components";
import {ExportModal} from "../../common";

const InfoTable = ({info}) => {
  return <table className="table">
    <tbody>
    {_(info[1])
      .map((val, key) => (<tr key={key}>
        <th>{key}</th>
        <td>{val}</td>
      </tr>))
      .value()}
    </tbody>
  </table>;
};

InfoTable.propTypes = {
  info: PropTypes.array
};

const CellTable = ({data}) => {
  return <table className="table">
    <tbody>
    <tr>
      <th>Pair</th>
      <td>{data.pair}</td>
    </tr>
    <tr>
      <th>Greater</th>
      <td>{data['greater'].toExponential(2)}</td>
    </tr>
    <tr>
      <th>Greater Adjusted</th>
      <td>{data['greater_adj'].toExponential(2)}</td>
    </tr>
    <tr>
      <th>Less</th>
      <td>{data['less'].toExponential(2)}</td>
    </tr>
    <tr>
      <th>Less Adjusted</th>
      <td>{data['less_adj'].toExponential(2)}</td>
    </tr>
    </tbody>
  </table>;
};

CellTable.propTypes = {
  data: PropTypes.object
};

const GeneList = styled.div.attrs(({className}) => ({
  className: classNames(className, 'text-monospace border border-light rounded')
}))`
  height: 30vh;
  overflow-y: scroll;
`;

const geneListLink = _.flow(
  _.partial(_.join, _, "\n"),
  _.partial(blobFromString, _, "text/plain"),
  URL.createObjectURL
);

class Cell extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      saveModal: false
    };

    this.toggle = this.toggle.bind(this);
    this.toggleSave = this.toggleSave.bind(this);
  }

  toggle() {
    this.setState({
      modal: !this.state.modal
    });
  }

  toggleSave() {
    this.setState({
      saveModal: !this.state.saveModal
    });
  }

  render() {
    let {children, data: {genes, ...d}, modal, className, innerClassName, style, side, info, ...props} = this.props;
    let {background} = style;
    let geneString = _.join(genes, '\n');
    // pass background from style to inner div, CSS trickery involved

    let geneLen = genes.length;

    return <div className={classNames("p-0 cell", side > 10 ? "border" : null, modal ? 'info-modal' : null, className)}
                style={{flexBasis: side, height: side, width: side, ...style}}
                {...props}>
      {modal ?
        [
          <div key={0} className={classNames("w-100 h-100", innerClassName)} style={{background}} onClick={this.toggle}>
            {children}
          </div>,
          <Modal key={1} isOpen={this.state.modal} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}>{info ? "Info" : "Enrichment"}</ModalHeader>
            {
              info ?
                <ModalBody>
                  <InfoTable info={info}/>
                </ModalBody> :
                <ModalBody>
                  <CellTable data={d}/>
                  {(geneLen ?
                    <div>
                      <p>Number of genes in common: {geneLen}</p>
                      <GeneList>
                        <pre>{geneString}</pre>
                      </GeneList>
                    </div> :
                    <p className="text-danger">No genes in common.</p>)}
                </ModalBody>
            }
            <ModalFooter>
              <Button color="primary" onClick={this.toggle} className="mr-1">Close</Button>
              {geneLen ?
                [
                  <a key={0}
                     className="btn btn-secondary"
                     download="genelist.txt"
                     href={geneListLink(genes)}>
                    <FontAwesomeIcon icon="file-export" className="mr-1"/>Export
                  </a>,
                  <button key={1} type="button" className="btn btn-secondary" onClick={this.toggleSave}>
                    <FontAwesomeIcon icon="save" className="mr-1"/>Save
                  </button>
                ] :
                null}
            </ModalFooter>
          </Modal>,
          <ExportModal key={2} isOpen={this.state.saveModal} toggle={this.toggleSave} genes={geneString}/>
        ] :
        <div className={classNames("w-100 h-100", innerClassName)}>{children}</div>}
    </div>;
  }
}

Cell.propTypes = {
  children: PropTypes.node,
  data: PropTypes.object,
  modal: PropTypes.bool,
  className: PropTypes.string,
  innerClassName: PropTypes.string,
  side: PropTypes.number.isRequired,
  info: PropTypes.array
};

Cell.defaultProps = {
  modal: false,
  data: {genes: []}
};

export default Cell;
