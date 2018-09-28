/**
 * @author zacharyjuang
 * 9/21/18
 */
import React from "react";
import _ from "lodash";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {getSummary} from "../../actions";
import * as d3 from "d3";
import CHART_STYLE from "!!raw-loader!sass-loader!../../styles/chart_style.scss";

function formatValues(d) {
  let vals = _.values(d);
  let [init, ...rest] = vals;
  let cumVals = _.reduce(rest, (o, v) => [...o, o[o.length - 1] + v], [init]);

  return _.zip(_.keys(d), vals, cumVals);
}

const sumVals = _.unary(_.flow(
  _.values,
  _.sum
));

function mapStateToProps({requestId, summary}) {
  return {
    requestId,
    summary
  };
}

class SummaryBody extends React.Component {
  constructor(props) {
    super(props);

    this.svg = React.createRef();

    this.state = {
      height: 0,
      width: 0
    };

    this.setHeight = _.debounce(this.setHeight.bind(this));

    this.margin = {
      top: 20,
      right: 30,
      bottom: 30,
      left: 40
    };
  }

  componentDidMount() {
    this.setHeight();
    window.addEventListener('resize', this.setHeight);

    let {top, bottom, left} = this.margin;
    let {height} = this.state;
    height -= top + bottom;

    this.chart = d3.select(this.svg.current)
      .attr("height", height + top + bottom)
      .append("g")
      .attr("transform", `translate(${left},${top})`);

    this.props.getSummary(this.props.requestId)
      .then(() => {
        this.draw();
      });
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.summary !== prevProps.summary) {
      // screw exit, we'll do the exit ourselves
      this.chart.selectAll("g").remove();
    }

    if (!_.isEmpty(this.props.summary) && (this.state.height !== prevState.height || this.state.width !== prevState.width)) {
      this.draw();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setHeight);
  }

  setHeight() {
    let {top, width} = this.svg.current.getBoundingClientRect();

    this.setState({
      height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - top,
      width
    });
  }

  draw() {
    let {top, right, bottom, left} = this.margin;
    let {height, width} = this.state;
    // let width = 960 - left - right;

    width -= left + right;
    height -= top + bottom;

    d3.select(this.svg.current)
      .attr("height", height + top + bottom);

    let {summary} = this.props;

    let keys = _.keys(summary.chart);
    let values = _.values(summary.chart);

    let x = d3.scaleBand().padding(0.5).domain(keys).range([0, width]);
    let y = d3.scaleLinear().domain([0, _(values).map(sumVals).max()]).range([height, 0]);

    let bar = this.chart.selectAll(".bar-group")
      .data(values);

    let barEnter = bar.enter()
      .append("g")
      .attr("class", "bar-group")
      .merge(bar)
      .attr("transform", (d, i) => `translate(${x(keys[i])}, 0)`);

    let innerKeys = _(values).map(_.keys).flatten().uniq().sortBy().value();

    let c = d3.scaleOrdinal(d3.schemeCategory10).domain(innerKeys);

    let subBars = barEnter.selectAll("rect")
      .data(formatValues);

    let subBarEnter = subBars
      .enter()
      .append("rect")
      .attr("fill", (d) => c(d[0]))
      .attr("class", "bar");

    subBarEnter.merge(subBars)
      .attr("y", function (d) {
        return y(d[2]);
      })
      .attr("height", function (d) {
        return height - y(d[1]);
      })
      .attr("width", x.bandwidth());

    let xAxis = d3.axisBottom(x);

    let ax = this.chart.select("g.x");
    ax = ax.size() ? ax : this.chart.append("g");

    ax
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(xAxis);

    console.log(ax);
  }

  render() {
    // let {height} = this.state;
    let {summary} = this.props;

    return <div>
      <div>Riveting content.</div>
      <svg className="w-100 chart" ref={this.svg}
           xmlns="http://www.w3.org/2000/svg"
           xmlnsXlink="http://www.w3.org/1999/xlink">
        <style>
          {CHART_STYLE}
        </style>
      </svg>
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
