/**
 * @author zacharyjuang
 * 11/13/18
 */
import _ from "lodash";
import {colorShader, columnString, getLogMinMax} from "../../../utils";
import React from "react";
import PropTypes from "prop-types";
import Cell from "./cell";
import {UncontrolledTooltip} from "reactstrap";
import classNames from "classnames";

const orangeShader = _.partial(colorShader, 40, 89.4, 52);
const blueShader = _.partial(colorShader, 229, 100, 25.9);

function buildName(c) {
  return `${c[0]} ${c[1]} ID: ${c[2]}`;
}

function buildPair(c1, c2) {
  return `(${buildName(c1)}, ${buildName(c2)})`;
}

function calculateSide(width, height, rows, hidden = [], minSide = 80) {
  return Math.max(Math.min(height, width) / (rows + 1 - hidden.length), minSide);
}

function calculateRows(data) {
  return _.size(data.info);
}

class HeaderCell extends React.PureComponent {
  constructor(props) {
    super(props);

    this.content = React.createRef();
  }

  render() {
    let {style, colStr, count, fontSize} = this.props;

    return <div style={style}>
      <div ref={this.content}>
        <div>{colStr}</div>
        <div style={{fontSize: Math.min(fontSize, 16)}}>({count})</div>
      </div>
      {fontSize < 16 ?
        <UncontrolledTooltip placement="right" target={() => this.content.current} style={{style: '1rem'}} delay={0}>
          {colStr}
        </UncontrolledTooltip> :
        null}
    </div>;
  }
}

HeaderCell.propTypes = {
  colStr: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  style: PropTypes.object,
  fontSize: PropTypes.number
};

class CellTooltip extends React.PureComponent {
  constructor(props) {
    super(props);

    this.content = React.createRef();
  }

  render() {
    return <div className="w-100 h-100">
      <div ref={this.content} className={classNames("w-100 h-100", this.props.className)}>
        {this.props.children}
      </div>
      <UncontrolledTooltip target={() => this.content.current} delay={0}>
        {columnString(this.props.i)}-{columnString(this.props.j)}
      </UncontrolledTooltip>
    </div>;
  }
}

CellTooltip.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  i: PropTypes.number.isRequired,
  j: PropTypes.number.isRequired
};

class EnrichmentGridBody extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      grid: []
    };

    this.timeouts = [];
  }

  componentDidMount() {
    this.loadGrid();
  }

  componentDidUpdate(prevProps) {
    if (this.props !== prevProps) {
      this.loadGrid();
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   return this.props.data !== nextProps.data || this.state !== nextState || !(this.props.height && this.props.width);
  // }

  componentWillUnmount() {
    this.clearTimeOuts();
  }

  clearTimeOuts(cancel = true) {
    if (cancel) {
      for (let t of this.timeouts) {
        cancelAnimationFrame(t);
      }
    }

    this.timeouts = [];
  }

  makeCell(i, j, side, data, gMin, gMax, lMin, lMax) {
    let style = {};

    if (this.props.hidden.indexOf(i - 1) !== -1 || this.props.hidden.indexOf(j - 1) !== -1) {
      return null;
    }

    if (i === j) {
      return <Cell key={j} style={style} className='diagonal' side={side}/>;
    } else if (i === 0 || j === 0) {
      let content, info;
      let fontSize = side * 0.3;
      style = {...style, fontSize};

      if (j > 0) {
        info = data.info[j - 1];
        content = <HeaderCell colStr={columnString(j)} count={info[1]['Count']}
                              fontSize={Math.min(fontSize, 16)}/>;
      } else {
        info = data.info[i - 1];
        content = <HeaderCell colStr={columnString(i)} count={info[1]['Count']}
                              fontSize={Math.min(fontSize, 16)}/>;
      }

      return <Cell key={j} style={style} side={side} info={info} modal
                   innerClassName="d-flex align-items-center justify-content-center">
        {content}
      </Cell>;
    } else if (i > 0 && j > 0) {
      let content;
      let fontSize = Math.min(side * 0.15, 16);
      let [c1, c2] = [data.info[i - 1][0], data.info[j - 1][0]];
      let idx = _.findIndex(data.columns, (c) => {
        return _.isEqual(c, [c1, c2]) || _.isEqual(c, [c2, c1]);
      });

      let d = {...data.data[idx], pair: buildPair(c1, c2)};

      if (j > i) {
        content = <div style={{fontSize}}>
          <div>greater:</div>
          <div title="p-value">{d['greater_adj'].toExponential(2)}</div>
          <div title="count">({d.genes.length})</div>
        </div>;
        style = {...style, ...orangeShader(d['greater_adj'], gMin, gMax)};
      } else {
        content = <div style={{fontSize}}>
          <div>less:</div>
          <div title="p-value">{d['less_adj'].toExponential(2)}</div>
          <div title="count">({d.genes.length})</div>
        </div>;
        style = {...style, ...blueShader(d['less_adj'], lMin, lMax)};
      }

      return <Cell key={j} style={style} side={side} data={d}
                   innerClassName="d-flex flex-column align-items-center justify-content-center"
                   modal>
        {fontSize > 5 ?
          <CellTooltip i={i} j={j}
                       className="d-flex flex-column align-items-center justify-content-center">{content}</CellTooltip> :
          <CellTooltip i={i} j={j}/>}
      </Cell>;
    }

    // eslint-disable-next-line no-console
    console.assert(false, "Should not reach here");
  }

  makeRow(i, rows, side, data, gMin, gMax, lMin, lMax) {
    if (rows && i < rows + 1) {
      let t = requestAnimationFrame(() => {
        this.setState((state) => ({
          grid: [
            ...state.grid,
            <div className="d-flex flex-row flex-nowrap p-0 m-0" key={i}>
              {_(_.range(0, rows + 1))
                .map(_.bind(this.makeCell, this, i, _, side, data, gMin, gMax, lMin, lMax))
                .value()}
            </div>
          ]
        }), this.makeRow.bind(this, i + 1, rows, side, data, gMin, gMax, lMin, lMax));
      });

      this.timeouts.push(t);
    } else {
      this.clearTimeOuts(false);
      if (_.isFunction(this.props.onLoad)) {
        this.props.onLoad();
      }
    }
  }

  loadGrid() {
    let {data, height, width, hidden} = this.props;

    let rows = calculateRows(data);
    let side = calculateSide(width, height, rows, hidden);

    let [gMin, gMax] = getLogMinMax(_(data.data).map('greater_adj'));
    let [lMin, lMax] = getLogMinMax(_(data.data).map('less_adj'));

    this.clearTimeOuts();

    this.setState({grid: []}, this.makeRow.bind(this, 0, rows, side, data, gMin, gMax, lMin, lMax));
  }

  render() {
    return <div style={{overflow: 'scroll'}} className="mh-100 mw-100 p-0 d-flex flex-column">{this.state.grid}</div>;
  }
}

EnrichmentGridBody.propTypes = {
  data: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  onLoad: PropTypes.func,
  hidden: PropTypes.arrayOf(PropTypes.number)
};

EnrichmentGridBody.defaultProps = {
  onLoad: _.noop
};

const EnrichmentGrid = React.forwardRef(({className, ...props}, ref) => {
  return <div className={className} ref={ref}>
    <EnrichmentGridBody {...props}/>
  </div>;
});

export default EnrichmentGrid;
