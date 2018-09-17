/**
 * @author zacharyjuang
 * 9/5/18
 */
import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import _ from "lodash";
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
                    let content;

                    if (i === j) {
                      style['background'] = 'grey';
                    }

                    if (i === 0 && j > 0) {
                      content = data.info[j - 1][0].join(', ');
                    } else if (j === 0 && i > 0) {
                      content = data.info[i - 1][0].join(', ');
                    }

                    if (i !== j && i > 0 && j > 0) {
                      let idx = _.findIndex(data.columns, (c) => {
                        let [c1, c2] = [data.info[i - 1][0], data.info[j - 1][0]];
                        return _.isEqual(c, [c1, c2]) || _.isEqual(c, [c2, c1]);
                      });
                      let d = data.data[idx];

                      if (j > i) {
                        content = [<div key={0}>greater:</div>,
                          <div key={1}>{d['greater_adj'].toExponential(2)}</div>,
                          <div key={2}>({d['greater'].toExponential(2)})</div>];
                        style = {...style, ...orangeShader(d['greater_adj'], gMin, gMax)};
                      } else {
                        content = [<div key={0}>less:</div>,
                          <div key={1}>{d['less_adj'].toExponential(2)}</div>,
                          <div key={2}>({d['less'].toExponential(2)})</div>];
                        style = {...style, ...blueShader(d['less_adj'], lMin, lMax)};
                      }
                    }

                    return <div className="col p-0 cell border" key={j} style={style}>
                      {content}
                    </div>;
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
