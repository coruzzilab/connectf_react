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
import palette from "google-palette";

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
      height: 0,
      width: 0
    };

    this.setHeight = _.debounce(this.setHeight.bind(this));
  }

  componentDidMount() {
    this.setHeight();
    window.addEventListener('resize', this.setHeight);

    this.props.getSummary(this.props.requestId);

    this.chart = new Chart(this.chartCtx.current.getContext("2d"), {
      type: 'bar',
      options: {
        title: {
          display: true,
          text: 'Summary'
        },
        tooltips: {
          mode: 'index',
          intersect: true
        },
        maintainAspectRatio: false,
        scales: {
          xAxes: [{
            stacked: true,
            ticks: {
              callback: function (value) {
                // needs improvement
                return value.slice(0, 9)
              }
            }
          }],
          yAxes: [{
            stacked: true
          }]
        }
      }
    });

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

  updateChart() {
    let {summary: {chart}} = this.props;

    let chartVals = _(chart).values();
    let chartKeys = chartVals.map(_.keys).flatten().sortBy().uniq();

    this.chart.data = {
      labels: _.keys(chart),
      datasets: chartKeys.zipWith(
        chartKeys.map((key) => chartVals.map(key).value()).value(),
        palette('tol', chartKeys.size()),
        (key, val, color) => {
          return {
            label: key,
            backgroundColor: '#' + color,
            stack: 'a',
            data: val
          };
        }
      ).value()
    };

    this.chart.update()
  }

  setHeight() {
    let {top, width} = this.chartCtx.current.getBoundingClientRect();

    this.setState({
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - top,
      width
    });
  }

  render() {
    let {height} = this.state;

    return <div>
      <div>Riveting content.</div>
      <div className="w-100" style={{height}}>
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
