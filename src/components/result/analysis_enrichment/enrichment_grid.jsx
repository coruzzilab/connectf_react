/**
 * @author zacharyjuang
 * 11/13/18
 */
import _ from "lodash";
import {colorShader, columnString, getLogMinMax} from "../../../utils";
import React from "react";
import PropTypes from "prop-types";
import Cell from "./cell";

const orangeShader = _.partial(colorShader, 40, 89.4, 52);
const blueShader = _.partial(colorShader, 229, 100, 25.9);

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

  componentWillUnmount() {
    this.clearTimeOuts();
  }

  clearTimeOuts() {
    for (let t of this.timeouts) {
      clearTimeout(t);
    }

    this.timeouts = [];
  }

  makeRow(i, rows, side, data, gMin, gMax, lMin, lMax) {
    if (rows && i < rows + 1) {
      let t = setTimeout(() => {
        this.setState((state) => ({
          grid: [
            ...state.grid,
            <div className="row d-flex justify-content-center" key={i}>
              {_(_.range(0, rows + 1))
                .map((j) => {
                  let style = {};

                  if (i === j) {
                    return <Cell key={j} style={style} className='diagonal' side={side}/>;
                  }

                  if (i === 0 || j === 0) {
                    let content, info;
                    let fontSize = side * 0.3;
                    style = {...style, fontSize};

                    if (j > 0) {
                      info = data.info[j - 1];
                      content = <div>
                        <div>{columnString(j)}</div>
                        <div style={{fontSize: Math.min(fontSize, 16)}}>({info[1]['Count']})</div>
                      </div>;
                    } else if (i > 0) {
                      info = data.info[i - 1];
                      content = <div>
                        <div>{columnString(i)}</div>
                        <div style={{fontSize: Math.min(fontSize, 16)}}>({info[1]['Count']})</div>
                      </div>;
                    }

                    return <Cell key={j} style={style} side={side} info={info} modal
                                 innerClassName="d-flex align-items-center justify-content-center">
                      {content}
                    </Cell>;
                  }

                  if (i !== j && i > 0 && j > 0) {
                    let content;
                    let fontSize = Math.min(side * 0.15, 16);
                    let idx = _.findIndex(data.columns, (c) => {
                      let [c1, c2] = [data.info[i - 1][0], data.info[j - 1][0]];
                      return _.isEqual(c, [c1, c2]) || _.isEqual(c, [c2, c1]);
                    });

                    let d = data.data[idx];

                    if (j > i) {
                      content = <div style={{fontSize}}>
                        <div>greater:</div>
                        <div>{d['greater_adj'].toExponential(2)}</div>
                        <div>({d.genes.length})</div>
                      </div>;
                      style = {...style, ...orangeShader(d['greater_adj'], gMin, gMax)};
                    } else {
                      content = <div style={{fontSize}}>
                        <div>less:</div>
                        <div>{d['less_adj'].toExponential(2)}</div>
                        <div>({d.genes.length})</div>
                      </div>;
                      style = {...style, ...blueShader(d['less_adj'], lMin, lMax)};
                    }

                    return <Cell key={j} style={style} side={side} data={d}
                                 innerClassName="d-flex flex-column align-items-center justify-content-center"
                                 modal>
                      {fontSize > 5 ? content : null}
                    </Cell>;
                  }

                  // eslint-disable-next-line no-console
                  console.assert(false, "Should not reach here");
                })
                .value()}
            </div>
          ]
        }), this.makeRow.bind(this, i + 1, rows, side, data, gMin, gMax, lMin, lMax));
      });

      this.timeouts.push(t);
    }
  }

  loadGrid() {
    let {data, height, width} = this.props;

    let rows = _.size(data.info);
    let side = Math.min(height, width) / (rows + 1);

    let [gMin, gMax] = getLogMinMax(_(data.data).map('greater_adj'));
    let [lMin, lMax] = getLogMinMax(_(data.data).map('less_adj'));

    this.clearTimeOuts();

    this.setState({grid: []}, this.makeRow.bind(this, 0, rows, side, data, gMin, gMax, lMin, lMax));
  }

  render() {
    return <div>{this.state.grid}</div>;
  }
}

EnrichmentGridBody.propTypes = {
  data: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number
};

const EnrichmentGrid = React.forwardRef(({className, ...props}, ref) => {
  return <div className={className} ref={ref}>
    <EnrichmentGridBody {...props}/>
  </div>;
});

export default EnrichmentGrid;
