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

const geneListLink = _.flow(
  _.partial(_.join, _, "\n"),
  _.partial(blobFromString, _, "text/plain"),
  URL.createObjectURL
);

class Cell extends React.Component {
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
    let {children, genes, modal, className, innerClassName, style, side, info, ...props} = this.props;
    let {background} = style;
    // pass background from style to inner div, CSS trickery involved

    let geneLen = genes.length;

    return <div className={classNames("col p-0 cell border", modal ? 'gene-modal' : null, className)}
                style={{flexBasis: side, height: side, ...style}}
                {...props}>
      {modal ?
        [
          <div key={0} className={classNames("w-100 h-100", innerClassName)} style={{background}} onClick={this.toggle}>
            {children}
          </div>,
          <Modal key={1} isOpen={this.state.modal} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}>Genes</ModalHeader>
            <ModalBody>
              {
                info ?
                  <div>
                    <p>Name: {info[0][0]}</p>
                    <p>Experiment ID: {info[0][1]}</p>
                    <p>Analysis ID: {info[0][2]}</p>
                    {_.map(info[1], (val, key) => <p key={key}>{key}: {val}</p>)}
                  </div> :
                  (geneLen ?
                    <div>
                      <p>Number of genes in common: {geneLen}</p>
                      <div style={{height: '30vh', overflowY: 'scroll'}}
                           className="text-monospace border border-light rounded">
                        <ul>
                          {_.map(genes, (g, i) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    </div> :
                    <span className="text-danger">No genes in common.</span>)
              }
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.toggle} className="mr-1">Close</Button>
              {geneLen ?
                <a className="btn btn-secondary"
                   download="genelist.txt"
                   href={geneListLink(genes)}>
                  <FontAwesomeIcon icon="file-export" className="mr-1"/>Export
                </a> :
                null}
            </ModalFooter>
          </Modal>
        ] :
        <div className={classNames("w-100 h-100", innerClassName)}>{children}</div>}
    </div>;
  }
}

Cell.propTypes = {
  children: PropTypes.node,
  genes: PropTypes.arrayOf(PropTypes.string),
  modal: PropTypes.bool,
  className: PropTypes.string,
  innerClassName: PropTypes.string,
  side: PropTypes.number.isRequired,
  info: PropTypes.array
};

Cell.defaultProps = {
  modal: false,
  genes: []
};

export default Cell;
