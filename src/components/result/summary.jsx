/**
 * @author zacharyjuang
 * 9/21/18
 */
import React from "react";
import _ from "lodash";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {getSummary} from "../../actions";
import Chart from "chart.js";

const COLOR = {
  'INDUCED': '#4daf4a',
  'REPRESSED': '#e41a1c',
  'BOUND': '#377eb8'
};

function simplifyEdge(edge) {
  if (edge.endsWith("INDUCED")) {
    return "INDUCED";
  } else if (edge.endsWith("REPRESSED")) {
    return "REPRESSED";
  }
  return "BOUND";

}

function mapStateToProps({requestId, summary}) {
  return {
    requestId,
    summary
  };
}

class SummaryBody extends React.Component {
  constructor(props) {
    super(props);

    this.chartCtx = React.createRef();

    this.state = {
      height: 0
    };

    this.setHeight = _.debounce(this.setHeight.bind(this));
  }

  componentDidMount() {
    this.setHeight();
    window.addEventListener('resize', this.setHeight);

    this.props.getSummary(this.props.requestId);

    this.initChart();

    this.updateChart();
  }

  componentDidUpdate(prevProps) {
    if (this.props.summary !== prevProps.summary) {
      this.updateChart();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setHeight);
    this.chart.destroy();
  }

  initChart() {
    // hack-tastic way of displaying a grouped bar chart to our specification
    // This is not the library's intended use case.
    this.chart = new Chart(this.chartCtx.current.getContext("2d"), {
      type: 'bar',
      options: {
        title: {
          display: true,
          text: 'Summary'
        },
        tooltips: {
          mode: 'x',
          position: 'nearest',
          intersect: false,
          filter: function (tooltipItem) {
            return tooltipItem.yLabel > 0;
          },
          callbacks: {
            title: function (tooltipItems, data) {
              return _.get(data.datasets, [_.get(tooltipItems, '0.datasetIndex'), 'tooltip']);
            }
          }
        },
        legend: {
          labels: {
            filter: function (legendItem, data) {
              // only show first of same label
              return _(data.datasets).map("label").map(simplifyEdge).findIndex((l) => l === legendItem.text) === legendItem.datasetIndex;
            },
            generateLabels: function (chart) {
              let legendItems = Chart.defaults.global.legend.labels.generateLabels(chart);
              _.forEach(legendItems, (l) => {
                l.text = simplifyEdge(l.text);
              });
              return legendItems;
            }
          },
          onClick: function (e, legendItem) {
            let label = legendItem.text;
            let index = legendItem.datasetIndex;
            let ci = this.chart;

            // hide all with same label at once
            _(_.range(ci.data.datasets.length))
              .filter((i) => simplifyEdge(ci.data.datasets[i].label) === label)
              .map(ci.getDatasetMeta.bind(ci))
              .forEach(function (meta) {
                meta.hidden = meta.hidden === null ? !ci.data.datasets[index].hidden : null;
              });

            ci.update();
          }
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            maxBarThickness: 50,
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: 'Transcription Factor ID'
            },
            ticks: {
              callback: function (value) {
                // needs improvement
                return /^[^\s,]+(?:\s*\([^\s,]+\))?/.exec(value)[0];
              }
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: '# of Edges'
            },
            stacked: true
          }]
        }
      }
    });
  }

  updateChart() {
    let {summary: {chart}} = this.props;

    let _chart = _(chart);
    let chartVals = _chart.values();
    let chartEdges = chartVals.map(_.keys).flatten().sortBy().uniq();
    let chartKeys = _chart.keys()
      .map((k) => {
        let i = k.indexOf(',');
        return [k.substr(0, i), k.substr(i + 1)];
      });

    let chartObj = _(chartKeys.zip(chartVals.value()).reduce((c, o) => _.set(c, o[0], o[1]), {}));

    let chartSize = chartObj.size();

    this.chart.data = {
      labels: chartObj.keys().value(),
      datasets: chartEdges.map(
        (edge) => {
          return chartObj.values().map((val, i) => {
            return _(val).toPairs().map(([k, v], j) => {
              let arr = Array(chartSize);
              _.fill(arr, 0);
              arr[i] = v[edge];

              return {
                label: edge,
                backgroundColor: COLOR[simplifyEdge(edge)],
                stack: j,
                data: arr,
                tooltip: k
              };
            }).filter((o) => o.data[i]).value();
          }).value();
        }
      ).flattenDeep().value()
    };

    this.chart.update();
  }

  setHeight() {
    let {top} = this.chartCtx.current.getBoundingClientRect();

    this.setState({
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - top
    });
  }

  render() {
    let {height} = this.state;

    return <div>
      <div style={{height}}>
        <canvas ref={this.chartCtx}/>
      </div>
    </div>;
  }
}

SummaryBody.propTypes = {
  requestId: PropTypes.string,
  summary: PropTypes.object,
  getSummary: PropTypes.func
};

const Summary = connect(mapStateToProps, {getSummary})(SummaryBody);

export default Summary;
