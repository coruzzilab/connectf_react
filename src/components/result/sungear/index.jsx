/**
 * @author zacharyjuang
 * 2019-07-02
 */
import React from 'react';
import {connect} from "react-redux";
import _ from 'lodash';
import PropTypes from 'prop-types';
import {instance} from "../../../utils/axios_instance";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {Collapse, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown} from "reactstrap";
import {
  ItemList as ItemListBody,
  Search,
  Sungear as SungearGraph,
  VertexCount
} from "sungear_react/src/components/sungear";
import {buildSearchRegex} from "sungear_react/src/utils";
import classNames from "classnames";
import {ExportModal} from "../common";

function mapStateToProps({requestId}) {
  return {
    requestId
  };
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

function resizeListWrapper(Tag) {
  class Wrapper extends React.Component {
    constructor(props) {
      super(props);

      this.itemRef = React.createRef();

      this.state = {
        height: 0
      };

      this.setSize = _.throttle(this.setSize.bind(this), 100);
    }

    componentDidMount() {
      this.setSize();
      window.addEventListener('resize', this.setSize);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.setSize);
    }

    setSize() {
      let {clientHeight} = document.documentElement;

      this.setState({
        height: clientHeight - this.itemRef.current.getBoundingClientRect().top
      });
    }

    render() {
      let {className, innerClassName, ...props} = this.props;
      return <div ref={this.itemRef} className={className}>
        <Tag height={this.state.height} className={innerClassName} {...props}/>
      </div>;
    }
  }

  Wrapper.propTypes = {
    className: PropTypes.string,
    innerClassName: PropTypes.string
  };

  return Wrapper;
}

const ItemList = resizeListWrapper(ItemListBody);

class SungearBody extends React.PureComponent {
  constructor(props) {
    super(props);

    this.canvas = React.createRef();
    this.listRef = React.createRef();

    this.state = {
      height: 0,
      width: 0,
      data: {},
      genes: [],

      genesCurr: [],
      genesPast: [],
      genesFuture: [],

      selected: [],
      labelFields: ['gene_id', 'gene_name', 'analysis_id'],
      labelOpen: false,
      vertexFormatter: {},

      modal: false,

      narrowError: false,

      searchTerm: ''
    };

    this.setSize = _.throttle(this.setSize.bind(this), 100);
  }

  componentDidMount() {
    this.getSungear();

    this.setSize();
    window.addEventListener('resize', this.setSize);
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.selected !== prevState.selected) {
      let genes = _(this.state.selected).map((s) => this.state.data.intersects[s][2]).flatten().sortBy().value();
      this.setState({
        genes
      }, () => {
        let {searchTerm} = this.state;
        if (searchTerm) {
          let searchRegex = buildSearchRegex(searchTerm);
          let scrollIndex = _.findIndex(genes, (g) => searchRegex.test(g));

          if (scrollIndex !== -1) {
            this.listRef.current.scrollToItem(scrollIndex, "start");
          }
        }
      });
    }

    if (!_.isEmpty(this.state.data) &&
      (this.state.labelFields !== prevState.labelFields ||
        this.state.data !== prevState.data)) {
      this.getVertexFormatter();
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setSize);
  }

  setSize() {
    let {width, top} = this.canvas.current.getBoundingClientRect();
    this.setState({
      height: document.documentElement.clientHeight - top,
      width
    });
  }

  handleSelect(selected) {
    this.setState({
      selected
    });
  }

  getSungear(genes) {
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

  flashNarrowError() {
    this.setState({
      narrowError: true
    });

    setTimeout(() => {
      this.setState({
        narrowError: false
      });
    }, 400);
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
      }).catch(this.flashNarrowError.bind(this));
    } else {
      this.flashNarrowError();
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

  resetClick() {
    this.getSungear().then(() => {
      this.setState({
        genesCurr: [],
        genesPast: [],
        genesFuture: []
      });
    });
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

  labelToggle() {
    this.setState((state) => ({
      labelOpen: !state.labelOpen
    }));
  }

  handleSearch(e) {
    this.setState({
      searchTerm: e.target.value
    });
  }

  getVertexLabel(idx) {
    let metadata = _.find(this.state.data.metadata, (m) => _.isEqual(m[0], idx))[1];

    return _.join(_.map(this.state.labelFields, (f) => metadata[f]), ' ');
  }

  getVertexFormatter() {
    let {data: {vertices}} = this.state;
    this.setState({
      vertexFormatter: _(vertices).reduce((res, [idx, coord]) => {
        res[idx] = this.getVertexLabel(idx);
        return res;
      }, {})
    });
  }

  toggle() {
    this.setState((state) => {
      return {
        modal: !state.modal
      };
    });
  }

  render() {
    let {width, height, genes, data, labelFields, selected, vertexFormatter, narrowError, searchTerm, labelOpen} = this.state;

    return <div className="container-fluid">
      <div className="row">
        <div className="col-6 w-100 pr-0" ref={this.canvas}>
          <SungearGraph width={width}
                        height={height}
                        data={data}
                        selected={selected}
                        onSelectChange={this.handleSelect.bind(this)}
                        vertexFormatter={vertexFormatter}/>
        </div>
        <div className="col-3">
          <p>
            {genes.length.toLocaleString()} genes selected
          </p>
          <div className="rounded border bg-light">
            <ItemList items={genes} listRef={this.listRef} className="list-group-flush"/>
          </div>
        </div>
        <div className="col-3">
          <div className="row m-1">
            <div className="col">
              <p>Sungear displays genes in common between any number of analyses.</p>
            </div>
          </div>
          <div className="row m-1">
            <div className="col">
              <div className="btn-group mr-1">
                <button type="button"
                        className={classNames("btn", narrowError ? "btn-danger" : "btn-primary")}
                        onClick={this.narrowClick.bind(this)}>
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
              <label htmlFor="search" className="sr-only">Search</label>
              <Search id="search"
                      value={searchTerm}
                      onChange={this.handleSearch.bind(this)}
                      data={data}
                      selected={selected}
                      onSelectChange={this.handleSelect.bind(this)}/>
            </div>
          </div>
          <div className="row m-1">
            <div className="col">
              <div className="d-inline mr-2">Views:</div>
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
          <div className="row m-1">
            <div className="col">
              <button className="btn btn-primary" onClick={this.labelToggle.bind(this)}>
                <Icon icon="tags" className="mr-1"/>Display Fields
              </button>
              <Collapse isOpen={labelOpen}>
                <div className="border rounded p-1 mt-1">
                  <div>Display Fields:</div>
                  <div>
                    {_(data.metadata).map(1).map(_.keys).flatten().uniq().map((n, i) => {
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
              </Collapse>
            </div>
          </div>
          <div className="row m-1">
            <div className="col">
              <VertexCount data={data} selected={selected} onSelectChange={this.handleSelect.bind(this)}/>
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
