/**
 * @author zacharyjuang
 * 2019-05-31
 */
import React from "react";
import Chart from "chart.js";
import _ from "lodash";
import PropTypes from "prop-types";

class OverviewChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.chartCtx = React.createRef();
  }

  componentDidMount() {
    this.chart = new Chart(this.chartCtx.current.getContext("2d"), {
      type: 'bar',
      options: {
        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          yAxes: [{
            ticks: {
              precision: 0,
              suggestedMin: 0
            }
          }],
          xAxes: [{
            maxBarThickness: 50,
            ticks: {
              autoSkip: true
            }
          }]
        }
      }
    });

    this.updateChart();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.summary !== this.props.summary || prevProps.chartKey !== this.props.chartKey) {
      this.updateChart();
    }
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  }

  updateChart() {
    let {summary, chartKey} = this.props;

    this.chart.data = {
      labels: _.map(_.get(summary, chartKey, []), 0),
      datasets: [{
        backgroundColor: '#1590C6',
        label: 'Analyses',
        data: _.map(_.get(summary, chartKey, []), 1)
      }]
    };

    this.chart.update();
  }

  render() {
    return <canvas ref={this.chartCtx} style={{height: '40vh'}}/>;
  }
}

OverviewChart.propTypes = {
  summary: PropTypes.object.isRequired,
  chartKey: PropTypes.string.isRequired
};

OverviewChart.defaultProps = {
  summary: {}
};

export default OverviewChart;
