/**
 * @author zacharyjuang
 * 9/21/18
 */
import React from "react";
import _ from "lodash";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {clearSummary, getSummary} from "../../actions";
import Chart from "chart.js";
import {QueryAlert} from "./common";
import {COLOR} from "../../utils";

function simplifyEdge(edge) {
  if (edge.endsWith("INDUCED")) {
    return "INDUCED";
  } else if (edge.endsWith("REPRESSED")) {
    return "REPRESSED";
  } else if (edge.endsWith("EXPRESSION")) {
    return "EXPRESSION";
  }
  return "BOUND";

}

function mapStateToProps({requestId, summary, result}) {
  return {
    requestId,
    summary,
    result
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
    this.updateChart = _.partial(_.defer, this.updateChart.bind(this));
  }

  componentDidMount() {
    this.setHeight();
    window.addEventListener('resize', this.setHeight);

    this.props.clearSummary();
    this.props.getSummary(this.props.requestId);

    this.initChart();

    this.updateChart();
  }

  componentDidUpdate(prevProps) {
    if (this.props.summary !== prevProps.summary) {
      this.setHeight();
      this.updateChart();
    }

    if (this.props.result !== prevProps.result) {
      this.props.getSummary(this.props.requestId);
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
      type: 'horizontalBar',
      options: {
        title: {
          display: true,
          text: 'Summary'
        },
        animation: false,
        tooltips: {
          mode: 'y',
          position: 'nearest',
          intersect: false,
          filter: function (tooltipItem) {
            return tooltipItem.xLabel > 0;
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
          yAxes: [{
            autoSkip: false,
            stacked: true,
            scaleLabel: {
              display: true,
              labelString: 'Transcription Factor ID'
            },
            ticks: {
              callback: function (value) {
                return /^[^"]+(?:"[^"]+")?/.exec(value)[0];
              }
            }
          }],
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Number of Edges'
            },
            stacked: true,
            position: 'top'
          }]
        }
      }
    });
  }

  updateChart() {
    let {summary: {chart, errors}} = this.props;

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
      datasets: chartEdges
        .map((edge) => {
          return chartObj.values().map((val, i) => {
            return _(val).toPairs().map(([k, v], j) => {
              let arr = new Array(chartSize);
              _.fill(arr, 0);
              arr[i] = v[edge];

              return {
                label: edge,
                backgroundColor: COLOR[simplifyEdge(edge)],
                stack: j,
                data: arr,
                tooltip: k,
                maxBarThickness: 50
              };
            }).filter((o) => o.data[i]).value();
          }).value();
        })
        .flattenDeep()
        .sortBy('stack')
        .value()
    };

    if (_.isArray(errors)) {
      this.chart.options.title.text = `Summary (${errors.join(' ')})`;
      this.chart.options.title.fontColor = 'red';
    } else {
      this.chart.options.title.text = 'Summary';
      this.chart.options.title.fontColor = '#666';
    }

    this.chart.update();
  }

  setHeight() {
    let {top} = this.chartCtx.current.getBoundingClientRect();
    let {summary: {chart}} = this.props;
    let currSize = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - top;
    let chartSize = _(chart)
      .keys()
      .map(_.partial(_.split, _, ',', 3))
      .map(0)
      .uniq()
      .size() * 100 + 100;

    this.setState({
      height: currSize >= chartSize ? currSize : chartSize
    });

    if (this.chart) {
      this.chart.update();
    }
  }

  render() {
    let {height} = this.state;

    return <div className="container-fluid">
      <div className="row">
        <div className="col">
          <QueryAlert className="mt-1" onExited={this.setHeight}/>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div style={{height}}>
            <canvas ref={this.chartCtx}/>
          </div>
        </div>
      </div>
    </div>;
  }
}

SummaryBody.propTypes = {
  requestId: PropTypes.string,
  summary: PropTypes.object,
  getSummary: PropTypes.func,
  clearSummary: PropTypes.func,
  result: PropTypes.object
};

const Summary = connect(mapStateToProps, {clearSummary, getSummary})(SummaryBody);

export default Summary;
