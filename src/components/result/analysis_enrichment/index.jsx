/**
 * @author zacharyjuang
 * 9/5/18
 */
import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import _ from "lodash";
import {getAnalysisEnrichment} from "../../../actions/analysis_enrichment";
import {colorShader, column_string, getLogMinMax} from "../../../utils";
import Cell from "./cell";
import {RowHeader} from "./common";

const orangeShader = _.partial(colorShader, 40, 89.4, 52);
const blueShader = _.partial(colorShader, 229, 100, 25.9);

function mapStateToProps({requestId, analysisEnrichment: {data, error}}) {
  return {
    requestId,
    data,
    error
  };
}

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
    if (this.container.current) {
      let {top, width} = this.container.current.getBoundingClientRect();
      this.setState({
        height: document.documentElement.clientHeight - top,
        width
      });
    }
  }

  render() {
    let {height, width} = this.state;
    let {data, error} = this.props;

    let rows = _.size(data.info);
    let side = Math.min(height, width) / (rows + 1);

    let [gMin, gMax] = getLogMinMax(_(data.data).map('greater_adj'));
    let [lMin, lMax] = getLogMinMax(_(data.data).map('less_adj'));

    return <div className="container-fluid">
      {error ?
        <p className="text-danger">
          Analysis Enrichment unavailable. Please query more than 1 analysis to see results.
        </p> :
        <div className="row">
          <div className="col p-0" ref={this.container}>
            {_(_.range(0, rows + 1))
              .map((i) => {
                return <div className="row d-flex justify-content-center" key={i}>
                  {_(_.range(0, rows + 1))
                    .map((j) => {
                      let style = {};

                      if (i === j) {
                        return <Cell key={j} style={style} className='diagonal' side={side}/>;
                      }

                      if (i === 0 || j === 0) {
                        let content, info;
                        style = {...style, fontSize: side * 0.3};

                        if (j > 0) {
                          info = data.info[j - 1];
                          content = <div>{column_string(j - 1)}</div>;
                        } else if (i > 0) {
                          info = data.info[i - 1];
                          content = <div>{column_string(i - 1)}</div>;
                        }

                        return <Cell key={j} style={style} side={side} info={info} modal
                                     innerClassName="d-flex align-items-center justify-content-center">
                          {content}
                        </Cell>;
                      }

                      if (i !== j && i > 0 && j > 0) {
                        let content;
                        let idx = _.findIndex(data.columns, (c) => {
                          let [c1, c2] = [data.info[i - 1][0], data.info[j - 1][0]];
                          return _.isEqual(c, [c1, c2]) || _.isEqual(c, [c2, c1]);
                        });
                        let d = data.data[idx];

                        if (j > i) {
                          content = <div>
                            <div>greater:</div>
                            <div>{d['greater_adj'].toExponential(2)}</div>
                            <div>({d.genes.length})</div>
                          </div>;
                          style = {...style, ...orangeShader(d['greater_adj'], gMin, gMax)};
                        } else {
                          content = <div>
                            <div>less:</div>
                            <div>{d['less_adj'].toExponential(2)}</div>
                            <div>({d.genes.length})</div>
                          </div>;
                          style = {...style, ...blueShader(d['less_adj'], lMin, lMax)};
                        }

                        return <Cell key={j} style={style} side={side} data={d}
                                     innerClassName="d-flex flex-column align-items-center justify-content-center"
                                     modal>
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
            <table className="table table-responsive">
              <thead>
              <tr>
                <th>Index</th>
                <th>Gene</th>
                <th>Filter</th>
                <th>Experiment ID</th>
                <th>Analysis ID</th>
              </tr>
              </thead>
              <tbody>
              {_.map(data.info, (info, i) => {
                return <tr key={i}>
                  <RowHeader info={info}>{column_string(i)}</RowHeader>
                  {_.map(info[0], (c, j) => <td key={j}>{c}</td>)}
                </tr>;
              })}
              </tbody>
            </table>
          </div>
        </div>
      }
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
