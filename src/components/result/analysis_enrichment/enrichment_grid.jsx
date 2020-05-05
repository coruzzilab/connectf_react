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
import {connect} from "react-redux";

const orangeShader = _.partial(colorShader('b2182b', 'fddbc7'));
const blueShader = _.partial(colorShader('2166ac', 'd1e5f0'));

function mapStateToProps({extraFields}) {
  return {
    extraFields
  };
}

function buildName(c) {
  return `${c[0]} ${c[1]} ID: ${c[3]}`;
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
    let {style, colStr, count, fontSize: headerFontSize, extraFieldData} = this.props;
    let fontSize = Math.min(headerFontSize, 16);

    return <div style={style}>
      <div ref={this.content}>
        <div>{colStr}</div>
        {extraFieldData ? <div style={{fontSize}}>{extraFieldData}</div> : null}
        <div style={{fontSize}}>({count})</div>
      </div>
      {headerFontSize < 16 ?
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
  fontSize: PropTypes.number,
  extraFieldData: PropTypes.node
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

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.extraFields !== nextProps.extraFields) {
      if (_.head(this.props.extraFields) === _.head(nextProps.extraFields)) {
        return false;
      }
    }
    return true;
  }

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
      let info, colStr;
      let extraField = _.head(this.props.extraFields);
      let fontSize = side * 0.3;
      style = {...style, fontSize};

      if (j > 0) {
        info = data.info[j - 1];
        colStr = columnString(j);
      } else {
        info = data.info[i - 1];
        colStr = columnString(i);
      }

      let extraFieldData = info[1][extraField];
      let content = <HeaderCell colStr={colStr} count={info[1]['Count']} extraFieldData={extraFieldData}
                                fontSize={Math.min(fontSize, 16)}/>;

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
    return <div style={{overflow: 'scroll'}}
                className={classNames("mh-100 mw-100 p-0 d-flex flex-column", this.props.className)}
                ref={this.props.innerRef}>{this.state.grid}</div>;
  }
}

EnrichmentGridBody.propTypes = {
  data: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  onLoad: PropTypes.func,
  hidden: PropTypes.arrayOf(PropTypes.number),
  innerRef: PropTypes.object,
  className: PropTypes.string,
  extraFields: PropTypes.arrayOf(PropTypes.string)
};

EnrichmentGridBody.defaultProps = {
  onLoad: _.noop
};

const EnrichmentGrid = connect(mapStateToProps, null)(EnrichmentGridBody);

export default EnrichmentGrid;
