/**
 * @author zacharyjuang
 * 2019-05-31
 */
import React from "react";
import Chart from "chart.js";
import _ from "lodash";
import PropTypes from "prop-types";
import ChartDataLabels from 'chartjs-plugin-datalabels';

Chart.plugins.unregister(ChartDataLabels);

class OverviewChart extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.chartCtx = React.createRef();
  }

  componentDidMount() {
    this.chart = new Chart(this.chartCtx.current.getContext("2d"), {
      type: 'pie',
      plugins: [ChartDataLabels],
      options: {
        maintainAspectRatio: false,
        legend: {
          display: true,
          position: 'left'
        },
        plugins: {
          datalabels: {
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: 3,
            display: function (context) {
              if (context.active) {
                // don't display active
                return false;
              } else if (context.dataset.data.length <= 5) {
                return true;
              } else {
                // display top 5, hide rest if overlapping.
                let cuttoff = _(context.dataset.data).orderBy(_.identity, "desc").slice(0, 5).min();
                let curr = context.dataset.data[context.dataIndex];

                if (curr >= cuttoff) {
                  return true;
                }

                return 'auto';
              }
            },
            formatter: function (value, context) {
              return context.chart.data.labels[context.dataIndex] + ': ' + value;
            }
          }
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
    let _chartData = _(_.get(summary, chartKey, []));
    let labels = _chartData.map(0).value();
    let data = _chartData.map(1).value();
    let backgroundColor = _chartData.map(2).value();

    this.chart.data = {
      labels,
      datasets: [{
        borderWidth: 1,
        backgroundColor,
        data
      }]
    };

    this.chart.update();
  }

  render() {
    let {style} = this.props;

    return <canvas ref={this.chartCtx} style={style}/>;
  }
}

OverviewChart.propTypes = {
  summary: PropTypes.object.isRequired,
  chartKey: PropTypes.string.isRequired,
  style: PropTypes.object
};

OverviewChart.defaultProps = {
  summary: {}
};

export default OverviewChart;
