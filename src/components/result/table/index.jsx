/**
 * @author zacharyjuang
 * 1/28/17
 */
import React from 'react';
import Handsontable from '../../../utils/handsontable';
import {connect} from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {TableExport, TargetExport} from "./export";
import classNames from 'classnames';

let mapStateToProps = ({result}) => {
  return {
    result
  };
};

function sortColumns(sortConfigs, data) {
  for (let config of sortConfigs) {
    let [nullRows, rows] = _.partition(data.slice(6), (o) => _.isNull(o[config.column]));
    data = [...data.slice(0, 6), ..._.orderBy(rows, [config.column], [config.sortOrder]), ...nullRows];
  }

  return data;
}

class TableBody extends React.Component {
  constructor(props) {
    super(props);

    this.grid = React.createRef();

    this.state = {
      search: ''
    };

    this.setSearch = _.debounce(this.setSearch.bind(this), 100);
  }

  componentDidMount() {
    let self = this;
    let hot = this.hot = new Handsontable(this.grid.current, {
      licenseKey: 'non-commercial-and-evaluation',
      readOnly: true,
      readOnlyCellClassName: '',
      rowHeaders: function (idx) {
        if (idx < 6) {
          return '';
        }
        return idx - 5;
      },
      columns: [],
      height: document.documentElement.clientHeight - this.grid.current.getBoundingClientRect().top,
      manualColumnResize: true,
      columnSorting: true,
      colHeaders: true,
      fixedRowsTop: 6,
      wordWrap: false,
      rowHeights: 24,
      cells: function (row, col) {
        let cellProperties = {};

        if (row === 0) {
          cellProperties.renderer = "newline";
          cellProperties.className = classNames(cellProperties.className, "font-weight-bold");
        }

        if ((row < 6 && row > 0) || col === 6 || col === 7) {
          cellProperties.renderer = 'renderBold';
        }

        // if (row > 5 && col === 7) {
        //   cellProperties.renderer = 'renderGene';
        // }

        if (col > 7 && row < 6) {
          cellProperties.className = classNames(cellProperties.className, "htCenter");
        }

        if (row < 6) {
          cellProperties.type = 'text';
        }

        return cellProperties;
      },
      colWidths: function (index) {
        if (index < 3) {
          return 200;
        }

        if (index === 3) {
          return 100;
        }

        if (index > 6) {
          return 120;
        }
      },
      search: true
    });

    let sort = hot.getPlugin('columnSorting');

    hot.addHook('afterOnCellMouseDown', function (event, {row, col: column}) {
      if (row === -1 && !event.realTarget.classList.contains('columnSorting')) {
        let sortConfig = sort.getSortConfig(column);
        if (!sortConfig) {
          sort.sort({column, sortOrder: "desc"});
        } else if (sortConfig.sortOrder === "desc") {
          sort.sort({column, sortOrder: "asc"});
        } else if (sortConfig.sortOrder === "asc") {
          sort.clearSort();
        }
      }
    });

    hot.addHook('beforeColumnSort', function (currentSortConfig, destinationSortConfigs) {
      sort.setSortConfig(destinationSortConfigs);

      self.filterRows();

      return false;
    });

    this.updateData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.result !== prevProps.result) {
      this.updateData();
    }

    if (this.state.search !== prevState.search) {
      this.filterRows();
    }
  }

  componentWillUnmount() {
    this.hot.destroy();
  }

  filterRows() {
    let data = _.get(this.props, 'result.result.data', []);

    let sort = this.hot.getPlugin('columnSorting');
    let search = this.hot.getPlugin('search');
    let queryString = search.getQueryMethod();

    if (this.state.search.length > 0) {
      data = [
        ...data.slice(0, 6),
        ..._(data.slice(6))
          .filter((row) => {
            return _(row).filter(queryString.bind(undefined, this.state.search)).some();
          })
          .value()
      ];
    }

    data = sortColumns(sort.getSortConfig(), data);

    this.hot.loadData(data);
  }

  updateData() {
    let {result} = this.props;
    let data = _.get(result, 'result.data', []);

    _.defer(() => {
      this.hot.loadData(data);
      this.hot.updateSettings({
        mergeCells: _.get(result, 'result.mergeCells', []),
        columns: _.get(result, 'result.columns', [])
      });
    });

  }

  setSearch(search) {
    this.setState({search});
  }

  render() {
    return <div className="container-fluid">
      <div className="row my-1 align-items-center">
        <div className="col-lg-4 col-sm">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <FontAwesomeIcon icon="search"/>
              </span>
            </div>
            <input type="text" placeholder="Search" className="form-control" onChange={(e) => {
              this.setSearch(e.target.value);
            }}/>
          </div>
        </div>
        <div className="col">
          <div className="btn-toolbar float-right">
            <div className="btn-group mr-1">
              <TableExport/>
            </div>
            <div className="btn-group">
              <TargetExport/>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div id="grid" ref={this.grid}/>
        </div>
      </div>
    </div>;
  }
}

TableBody.propTypes = {
  result: PropTypes.object
};

const Table = connect(mapStateToProps)(TableBody);

export default Table;
