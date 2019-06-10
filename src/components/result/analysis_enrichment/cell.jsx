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
    let {children, data: {genes, ...d}, modal, className, innerClassName, style, side, info, ...props} = this.props;
    let {background} = style;
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
            <ModalHeader toggle={this.toggle}>Genes</ModalHeader>
            <ModalBody>
              {
                info ?
                  <div>
                    <p>Name: {info[0][0]}</p>
                    <p>Filter: {info[0][1]}</p>
                    <p>Analysis ID: {info[0][2]}</p>
                    {_.map(info[1], (val, key) => <p key={key}>{key}: {val}</p>)}
                  </div> :
                  <div>
                    <p>Pair: {d.pair}</p>
                    <p>Greater: {d['greater'].toExponential(2)}</p>
                    <p>Greater Adjusted: {d['greater_adj'].toExponential(2)}</p>
                    <p>Less: {d['less'].toExponential(2)}</p>
                    <p>Less Adjusted: {d['less_adj'].toExponential(2)}</p>
                    {(geneLen ?
                      <div>
                        <p>Number of genes in common: {geneLen}</p>
                        <GeneList>
                          <pre>{_.join(genes, '\n')}</pre>
                        </GeneList>
                      </div> :
                      <p className="text-danger">No genes in common.</p>)}
                  </div>
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
