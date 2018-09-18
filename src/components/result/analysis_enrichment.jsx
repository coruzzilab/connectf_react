/**
 * @author zacharyjuang
 * 9/5/18
 */
import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import _ from "lodash";
import classNames from "classnames";
import {getAnalysisEnrichment} from "../../actions/analysis_enrichment";
import {colorShader, getLogMinMax} from "../../utils";

const orangeShader = _.partial(colorShader, 40, 89.4, 52);
const blueShader = _.partial(colorShader, 229, 100, 25.9);

function mapStateToProps({requestId, analysisEnrichment: {data, error}}) {
  return {
    requestId,
    data,
    error
  };
}

export class Cell extends React.Component {
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
    let {children, genes, modal, className, style, ...props} = this.props;
    let {background} = style;
    // pass background from style to inner div, CSS trickery involved

    return <div className={classNames("col p-0 cell border", modal ? 'gene-modal' : null, className)}
                style={style}
                {...props}>
      {modal ?
        [
          <div key={0} className="w-100 h-100" style={{background}} onClick={this.toggle}>
            {children}
          </div>,
          <Modal key={1} isOpen={this.state.modal} toggle={this.toggle}>
            <ModalHeader toggle={this.toggle}>Genes</ModalHeader>
            <ModalBody>
              {_.size(genes) ?
                <ul>
                  {_.map(genes, (g, i) => <li key={i}>{g}</li>)}
                </ul> :
                <span className="text-danger">No genes in common.</span>
              }
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={this.toggle}>OK</Button>
            </ModalFooter>
          </Modal>
        ] :
        children}
    </div>;
  }
}

Cell.propTypes = {
  children: PropTypes.node,
  genes: PropTypes.arrayOf(PropTypes.string),
  modal: PropTypes.bool,
  className: PropTypes.string
};

Cell.defaultProps = {
  modal: false
};

class AnalysisEnrichmentBody extends React.Component {
  constructor(props) {
    super(props);

    this.container = React.createRef();

    this.state = {
      height: 0,
      width: 0
    };

    this.setSize = _.debounce(this.setSize.bind(this), 100);
  }

  componentDidMount() {
    this.setSize();
    window.addEventListener("resize", this.setSize);

    this.props.getAnalysisEnrichment(this.props.requestId);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.setSize);
  }

  setSize() {
    let rect = this.container.current.getBoundingClientRect();
    this.setState({
      height: document.documentElement.clientHeight - rect.top,
      width: rect.width
    });
  }

  render() {
    let {height, width} = this.state;
    let {data} = this.props;

    let rows = _.size(data.info);
    let side = Math.min(height, width) / (rows + 1);

    let [gMin, gMax] = getLogMinMax(_(data.data).map('greater_adj'));
    let [lMin, lMax] = getLogMinMax(_(data.data).map('less_adj'));

    return <div className="container-fluid">
      <div className="row">
        <div className="col p-0" ref={this.container}>
          {_(_.range(0, rows + 1))
            .map((i) => {
              return <div className="row d-flex justify-content-center" key={i}>
                {_(_.range(0, rows + 1))
                  .map((j) => {
                    let style = {flexBasis: side, height: side};

                    if (i === j) {
                      return <Cell key={j} style={style} className='diagonal'/>;
                    }

                    if (i === 0 || j === 0) {
                      let content;

                      if (j > 0) {
                        content = data.info[j - 1][0].join(', ');
                      } else if (i > 0) {
                        content = data.info[i - 1][0].join(', ');
                      }

                      return <Cell key={j} style={style}>
                        {content}
                      </Cell>;
                    }

                    if (i !== j && i > 0 && j > 0) {
                      let content;
                      let idx = _.findIndex(data.columns, (c) => {
                        let [c1, c2] = [data.info[i - 1][0], data.info[j - 1][0]];
                        return _.isEqual(c, [c1, c2]) || _.isEqual(c, [c2, c1]);
                      });
                      let {genes, ...d} = data.data[idx];

                      if (j > i) {
                        content = <div>
                          <div>greater:</div>
                          <div>{d['greater_adj'].toExponential(2)}</div>
                          <div>({d['greater'].toExponential(2)})</div>
                        </div>;
                        style = {...style, ...orangeShader(d['greater_adj'], gMin, gMax)};
                      } else {
                        content = <div>
                          <div>less:</div>
                          <div>{d['less_adj'].toExponential(2)}</div>
                          <div>({d['less'].toExponential(2)})</div>
                        </div>;
                        style = {...style, ...blueShader(d['less_adj'], lMin, lMax)};
                      }

                      return <Cell key={j} style={style} genes={genes} modal>
                        {content}
                      </Cell>;
                    }

                    // eslint-disable-next-line no-console
                    console.assert(false, "Should not reach here");
                  })
                  .value()}
              </div>;
            })
            .value()}
        </div>
        <div className="col">
          hmm
        </div>
      </div>
    </div>;
  }
}

AnalysisEnrichmentBody.propTypes = {
  getAnalysisEnrichment: PropTypes.func,
  requestId: PropTypes.string,
  data: PropTypes.object,
  error: PropTypes.bool
};

const AnalysisEnrichment = connect(mapStateToProps, {getAnalysisEnrichment})(AnalysisEnrichmentBody);

export default AnalysisEnrichment;
