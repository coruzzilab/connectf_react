/**
 * @author zacharyjuang
 * 2019-07-02
 */
import React from 'react';
import {connect} from "react-redux";
import Raphael from 'raphael';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {instance} from "../../../utils/axios_instance";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown} from "reactstrap";
import {ExportModal} from "../table/export";

function mapStateToProps({requestId}) {
  return {
    requestId
  };
}

function distance(x1, y1, x2, y2) {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function subtract(p1, p2) {
  return [p2[0] - p1[0], p2[1] - p1[1]];
}

function add(p1, p2) {
  return [p2[0] + p1[0], p2[1] + p1[1]];
}

function scaleVector(v, scale = 1, xoffset = 0, yoffset = 0) {
  return [v[0] * scale + xoffset, v[1] * scale + yoffset];
}

function saveSvg(svgEl, name) {
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  let svgData = svgEl.outerHTML;
  let preface = '<?xml version="1.0" standalone="no"?>\r\n';
  let svgBlob = new Blob([preface, svgData], {type: "image/svg+xml;charset=utf-8"});
  let svgUrl = URL.createObjectURL(svgBlob);
  let downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

class SungearBody extends React.Component {
  constructor(props) {
    super(props);

    this.canvas = React.createRef();

    this.circles = [];
    this.labels = [];

    this.state = {
      height: 0,
      data: {},
      genes: [],

      genesCurr: [],
      genesPast: [],
      genesFuture: [],

      selected: [],
      labelFields: ['analysis_id', 'gene_id', 'gene_name'],

      modal: false
    };

    this.mousedown = false;
    this.mousedownStart = 0;

    this.setHeight = _.debounce(this.setHeight.bind(this), 100);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleDrag = this.handleDrag.bind(this);
  }

  componentDidMount() {
    this.paper = Raphael(this.canvas.current);
    this.canvas.current.addEventListener('wheel', this.handleScroll);
    this.canvas.current.addEventListener('drag', this.handleDrag);
    this.canvas.current.addEventListener('mousedown', (e) => {
      this.prevX = e.x;
      this.prevY = e.y;
      this.mousedown = true;
      this.mousedownStart = e.timeStamp;
    });
    this.canvas.current.addEventListener('mouseup', () => {
      this.mousedown = false;
    });
    this.canvas.current.addEventListener('click', (e) => {
      if (e.timeStamp - this.mousedownStart < 500) {
        this.setState({selected: []});
      }
    });

    this.canvas.current.addEventListener('mousemove', this.handleDrag);

    this.scale = 1;
    this.vX = 0;
    this.vY = 0;

    this.prevX = 0;
    this.prevY = 0;

    this.getSungear();

    this.setHeight();
    window.addEventListener('resize', this.setHeight);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.height && _.size(this.state.data) &&
      (this.state.height !== prevState.height || this.state.data !== prevState.data || this.state.labelFields !== prevState.labelFields)) {
      this.draw();
    }

    if (this.state.selected !== prevState.selected) {
      this.setState({
        genes: _(this.state.selected).map((s) => this.state.data.intersects[s][2]).flatten().sortBy().value()
      });

      for (let [i, c] of this.circles.entries()) {
        if (this.state.selected.indexOf(i) !== -1) {
          c.attr("stroke", "#257AFD");
        } else {
          c.attr("stroke", "#000");
        }
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setHeight);
  }

  setHeight() {
    this.setState({height: document.documentElement.clientHeight - this.canvas.current.getBoundingClientRect().top},
      () => {
        if (this.paper) {
          this.paper.setSize(this.paper.width, this.state.height);
        }
      });
  }

  getSungear(genes) {
    this.resetView();
    if (!genes) {
      return instance.get(`/api/sungear/${this.props.requestId}/`).then(({data}) => {
        this.setState({data, selected: []});
      });
    } else {
      return instance.post(`/api/sungear/${this.props.requestId}/`, {genes}).then(({data}) => {
        this.setState({data, selected: []});
      });
    }
  }

  narrowClick(e) {
    e.preventDefault();
    if (this.state.genes.length) {
      let {genes} = this.state;
      this.getSungear(genes).then(() => {
        this.setState((state) => {
          return {
            genesPast: [...state.genesPast, state.genesCurr],
            genesCurr: genes,
            genesFuture: []
          };
        });
      });
    }
  }

  prevClick(e) {
    e.preventDefault();
    let {genesPast} = this.state;
    let prevs = genesPast.slice(0, genesPast.length - 1);
    let curr = genesPast[genesPast.length - 1];

    this.getSungear(curr).then(() => {
      this.setState((state) => {
        return {
          genesCurr: curr,
          genesPast: prevs,
          genesFuture: [state.genesCurr, ...state.genesFuture]
        };
      });
    });
  }

  nextClick(e) {
    e.preventDefault();
    let {genesFuture} = this.state;
    let [curr, ...futures] = genesFuture;

    this.getSungear(curr).then(() => {
      this.setState((state) => {
        return {
          genesCurr: curr,
          genesPast: [...state.genesPast, state.genesCurr],
          genesFuture: futures
        };
      });
    });
  }

  resetClick(e) {
    this.resetView();
    this.getSungear().then(() => {
      this.setState({
        genesCurr: [],
        genesPast: [],
        genesFuture: []
      });
    });
  }

  get vW() {
    return this.paper.width * this.scale;
  }

  get vH() {
    return this.paper.height * this.scale;
  }

  handleScroll(e) {
    e.preventDefault();

    let {deltaY} = e;

    if (deltaY > 0) {
      this.scale *= 1.05;
    } else if (deltaY < 0) {
      this.scale *= 0.95;
    }

    window.requestAnimationFrame(() => {
      this.paper.setViewBox(this.vX, this.vY, this.vW, this.vH);
    });
  }

  handleDrag(e) {
    e.preventDefault();
    if (this.mousedown) {
      this.vX += (this.prevX - e.x) * this.scale;
      this.vY += (this.prevY - e.y) * this.scale;

      this.prevX = e.x;
      this.prevY = e.y;

      window.requestAnimationFrame(() => {
        this.paper.setViewBox(this.vX, this.vY, this.vW, this.vH);
      });
    }
  }

  resetView() {
    this.scale = 1;
    this.vX = 0;
    this.vY = 0;

    this.paper.setViewBox(0, 0, this.vW, this.vH);
  }

  draw() {
    let self = this;
    let {height, data, labelFields} = this.state;
    let {width} = this.canvas.current.getBoundingClientRect();
    let side = Math.min(width, height);
    let polygon, r, polySide;
    let center = [side / 2 + 0.05 * width, side / 2]; // @todo: move to center of page
    const applyHeight = _.partial(scaleVector, _, side, 0.05 * width);
    this.circles = [];
    this.labels = [];

    this.paper.clear();

    let vertices = _.map(data.vertices, ([n, coords]) => {
      return [n, applyHeight(coords)];
    });

    let v = _.map(vertices, 1);

    let intersects = _.map(data.intersects, ([v, c, g, s, arrows]) => {
      return [v, applyHeight(c), g, s * side, _.map(arrows, _.unary(applyHeight))];
    });

    if (_.size(v) === 2) {
      r = distance(...v[0], ...v[1]) / 2;
      polygon = this.paper.path(`
        M ${v[0][0]} ${v[0][1]}
        A ${r} ${r} 0 0 1 ${v[1][0]} ${v[1][1]}
        A ${r} ${r} 0 0 1 ${v[0][0]} ${v[0][1]}
      `);
      polySide = r;
    } else {
      let [v0, ...vr] = v;
      polySide = distance(...v0, ...v[1]);
      r = polySide / (2 * Math.tan(Math.PI / v.length));
      polygon = this.paper.path(`M ${v0[0]} ${v0[1]}\n` + _([...vr, v0]).map((vi) => `L ${vi[0]} ${vi[1]}`).join('\n'));
    }

    for (let [j, [idx, v]] of vertices.entries()) {
      let cv = subtract(center, v);
      let vlen = distance(...cv, 0, 0);
      let vloc = add(scaleVector(cv, (20 + vlen) / vlen), center);

      let rotation = (360 - (360 / vertices.length) * j) % 360;

      let t = this.paper.text(...vloc, _.join(_.map(labelFields, (f) => data.metadata[idx][f]), ' ') || idx.toString());
      let tW = t.getBBox().width;

      this.labels.push(t);

      // keep text as upright as possible
      if (rotation < 270 && rotation > 90) {
        t.rotate(rotation - 180);
      } else {
        t.rotate(rotation);
      }

      if (tW > polySide) {
        // scale if too big
        let s = polySide / tW;
        t.scale(s, s);
      }

      t.mouseover(function () {
        this.attr("fill", "#257AFD");

        _.forEach(intersects, (n, i) => {
          if (n[0].indexOf(idx) !== -1) {
            let c = self.circles[i].attr("fill", "#257AFD");
            c.toFront();
          }
        });
      });

      t.mouseout(function () {
        this.attr("fill", "#000");

        _.forEach(intersects, (n, i) => {
          if (n[0].indexOf(idx) !== -1) {
            self.circles[i].attr("fill", "#fff");
          }
        });
      });

      t.click((e) => {
        e.stopPropagation();
        let toSelect = _(intersects).map((n, i) => {
          if (n[0].indexOf(idx) !== -1) {
            return i;
          }
        }).filter(_.negate(_.isUndefined)).value();

        if (e.metaKey) {
          this.setState({
            selected: _.uniq([...this.state.selected, ...toSelect])
          });
        } else if (e.altKey) {
          this.setState({
            selected: _.difference(this.state.selected, toSelect)
          });
        } else {
          this.setState({
            selected: toSelect
          });
        }
      });
    }

    let numThings = _(intersects).map(4).map(_.size).sum();

    for (let [i, n] of intersects.entries()) {
      let c = this.paper.circle(...n[1], n[3]);
      this.circles.push(c);

      c.attr({fill: "#fff", 'fill-opacity': 1});

      c.click((e) => {
        e.stopPropagation();
        if (e.metaKey) {
          if (this.state.selected.indexOf(i) === -1) {
            this.setState({
              selected: [...this.state.selected, i]
            });
          } else {
            this.setState({
              selected: this.state.selected.filter((s) => s !== i)
            });
          }
        } else {
          this.setState({
            selected: [i]
          });
        }
      });

      c.mouseover(function () {
        this.attr({fill: "#257AFD", 'fill-opacity': 1});

        for (let idx of n[0]) {
          self.labels[_.findIndex(vertices, (v) => v[0] === idx)].attr("fill", "#257AFD");
        }
      });

      c.mouseout(function () {
        c.attr({fill: "#fff", 'fill-opacity': 1});

        for (let idx of n[0]) {
          self.labels[_.findIndex(vertices, (v) => v[0] === idx)].attr("fill", "#000");
        }
      });

      if (numThings < 600) {
        for (let a of n[4]) {
          let p = this.paper.path(`
          M ${n[1][0]} ${n[1][1]}
          L ${a[0]} ${a[1]}
          `);
          p.attr("arrow-end", "classic");
        }
        c.toFront();
      } else {
        let arrows = this.paper.set();

        c.mouseover(() => {
          c.attr('fill-opacity', 1);
          for (let a of n[4]) {
            let p = this.paper.path(`
            M ${n[1][0]} ${n[1][1]}
            L ${a[0]} ${a[1]}
            `);
            p.attr("arrow-end", "classic");

            arrows.push(p);
            c.toFront();
          }
        });

        c.mouseout(() => {
          c.attr('fill-opacity', 0);
          arrows.remove();
          arrows.clear();
        });
      }
    }
  }

  inverseSelection() {
    let {data: {intersects}, selected} = this.state;

    this.setState({
      selected: _.difference(_.range(_.size(intersects)), selected)
    });
  }

  exportSvg() {
    try {
      saveSvg(this.canvas.current.getElementsByTagName('svg')[0], 'sungear.svg');
    } catch (e) {
      // ignore errors
    }
  }

  handleLabelFieldCheck(n, e) {
    if (e.target.checked) {
      this.setState({
        labelFields: [...this.state.labelFields, n]
      });
    } else {
      this.setState({
        labelFields: this.state.labelFields.filter((l) => l !== n)
      });
    }
  }

  toggle() {
    this.setState((state) => {
      return {
        modal: !state.modal
      };
    });
  }

  render() {
    let {height, genes, data: {metadata}, labelFields} = this.state;

    return <div className="container-fluid">
      <div className="row">
        <div ref={this.canvas} className="col-8" style={{width: '100%', height}}/>
        <div className="col-4">
          <div className="row m-1">
            <div className="col">
              <div className="btn-group mr-1">
                <button type="button" className="btn btn-primary" onClick={this.resetView.bind(this)}>
                  <Icon icon="expand" className="mr-1"/>Center
                </button>
                <button type="button" className="btn btn-primary" onClick={this.narrowClick.bind(this)}>
                  <Icon icon="filter" className="mr-1"/>Narrow
                </button>
                <button type="button" className="btn btn-primary" onClick={this.inverseSelection.bind(this)}>
                  <Icon icon="object-group" className="mr-1"/>Inverse
                </button>
                <button type="button" className="btn btn-primary"
                        onClick={this.resetClick.bind(this)}>
                  <Icon icon="sync" className="mr-1"/>Reset
                </button>
              </div>

            </div>
          </div>
          <div className="row m-1">
            <div className="col">
              <div>Selections:</div>
              <div className="btn-group">
                <button type="button" className="btn btn-primary"
                        disabled={!this.state.genesPast.length}
                        onClick={this.prevClick.bind(this)}>
                  <Icon icon="arrow-circle-left" className="mr-1"/>Previous
                </button>
                <button type="button" className="btn btn-primary"
                        disabled={!this.state.genesFuture.length}
                        onClick={this.nextClick.bind(this)}>
                  Next<Icon icon="arrow-circle-right" className="ml-1"/>
                </button>
              </div>
            </div>
          </div>
          <div className="row m-1">
            <div className="col">
              <div className="btn-group">
                <UncontrolledButtonDropdown>
                  <DropdownToggle caret color="primary">
                    <Icon icon="file-export" className="mr-1"/>Export Genes
                  </DropdownToggle>
                  <DropdownMenu>
                    <DropdownItem onClick={this.toggle.bind(this)}>
                      <Icon icon="save" className="mr-1"/>Save As Temporary List
                    </DropdownItem>
                    <DropdownItem href={'data:text/plain,' + _.join(this.state.genes, '\n') + '\n'}
                                  download="genes.txt">
                      <Icon icon="file-alt" className="mr-1"/>Text File (*.txt)
                    </DropdownItem>
                  </DropdownMenu>
                </UncontrolledButtonDropdown>
                <button type="button" className="btn btn-primary" onClick={this.exportSvg.bind(this)}>
                  <Icon icon="image" className="mr-1"/>Export Image
                </button>
              </div>
              <ExportModal isOpen={this.state.modal} toggle={this.toggle.bind(this)}
                           genes={_.join(genes, "\n") + "\n"}/>
            </div>
          </div>
          <div className="row">
            <div className="col border rounded m-1">
              <div>Display Fields:</div>
              <div>
                {_(metadata).values().map(_.keys).flatten().uniq().map((n, i) => {
                  return <div className="form-check form-check-inline" key={i}>
                    <label className="form-check-label">
                      <input className="form-check-input"
                             type="checkbox"
                             onChange={this.handleLabelFieldCheck.bind(this, n)}
                             checked={labelFields.indexOf(n) !== -1}/>{n}
                    </label>
                  </div>;
                }).value()}
              </div>
              <div className="mb-1">
                <button type="button" className="btn btn-danger" onClick={() => {
                  this.setState({labelFields: []});
                }}>Clear
                </button>
              </div>
            </div>
          </div>
          <div className="row m-1">
            <div className="col">
              <p>
                {genes.length.toLocaleString()} genes
              </p>
              <div className="overflow-auto" style={{maxHeight: '40vh'}}>
                <ul className="list-group">
                  {_.map(genes, (g, i) => <li key={i} className="list-group-item">{g}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>;
  }
}

SungearBody.propTypes = {
  requestId: PropTypes.string
};

const Sungear = connect(mapStateToProps)(SungearBody);

export default Sungear;
