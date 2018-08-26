/**
 * @author zacharyjuang
 * 1/28/17
 */
import React from 'react';
import Handsontable from '../../../utils/handsontable';
import defaultSort from 'handsontable/src/plugins/columnSorting/sortFunction/default';
import {connect} from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

const NON_ALPHANUMERIC = /^\W*|\W*$/g;

let mapStateToProps = ({result}) => {
  return {
    result
  };
};

function normalizeSearchString(value) {
  return _.isString(value) ? value.replace(NON_ALPHANUMERIC, '') : value;
}

class TableBody extends React.Component {
  constructor(props) {
    super(props);

    this.search = React.createRef();
    this.grid = React.createRef();

    this.state = {
      height: Math.floor(document.documentElement.clientHeight * 0.8)
    };

    this.setHeight = _.debounce(this.setHeight.bind(this), 100);
  }

  componentDidMount() {
    let hot = this.hot = new Handsontable(this.grid.current, {
      rowHeaders: function (idx) {
        if (idx < 6) {
          return '';
        }
        return idx - 5;
      },
      manualColumnResize: true,
      columnSorting: true,
      colHeaders: true,
      fixedRowsTop: 6,
      wordWrap: false,
      rowHeights: 24,
      cells: function (row, col) {
        let cellProperties = {};

        if (row < 6 || col === 6 || col === 7) {
          cellProperties.renderer = 'renderBold';
        }

        if (col > 7 && row < 6) {
          cellProperties.className = "htCenter";
        }

        if (row < 6) {
          cellProperties.type = 'text';
          cellProperties.wordWrap = true;
        }

        if (col < 4) {
          cellProperties.colWidths = 200;
        }

        if (col > 7) {
          cellProperties.colWidths = 120;
        }

        return cellProperties;
      },
      search: true,
      sortIndicator: true,
      sortFunction: function (sortOrder, columnMeta) {
        let skippedRows = 6;

        return function (a, b) {
          if (a[0] < skippedRows) {
            if (a[0] > b[0]) {
              return 1;
            }
            return -1;
          }
          if (b[0] < skippedRows) {
            if (a[0] < b[0]) {
              return -1;
            }
            return 1;
          }

          return defaultSort(sortOrder, columnMeta)(
            [a[0], normalizeSearchString(a[1])],
            [b[0], normalizeSearchString(b[1])]);
        };
      }
    });

    let sort = hot.getPlugin('columnSorting');
    let search = hot.getPlugin('search');
    let queryString = search.getQueryMethod();

    hot.addHook('afterOnCellMouseDown', function (event, {row, col}) {
      if (row === -1) {
        sort.sort(col);
      }
    });

    Handsontable.dom.addEvent(this.search.current, 'keyup', _.debounce(function () {
      let {result} = this.props;
      let data = _.get(result, '0.data', []);

      if (this.value.length > 0) {
        hot.loadData([
          ...data.slice(0, 6),
          ..._(data.slice(6))
            .filter((row) => {
              return _(row).filter(queryString.bind(undefined, this.value)).some();
            })
            .value()
        ]);
      } else {
        hot.loadData(data);
      }
    }, 150));

    this.updateData();

    this.setHeight();
    window.addEventListener("resize", this.setHeight);
  }

  componentDidUpdate(prevProps) {
    if (this.props.result !== prevProps.result) {
      this.updateData();
    }
  }

  componentWillUnmount() {
    this.hot.destroy();
    window.removeEventListener("resize", this.setHeight);
  }

  updateData() {
    let {result} = this.props;
    let data = _.get(result, '0.data', []);

    _.defer(() => {
      this.hot.loadData(data);
      this.hot.updateSettings({
        mergeCells: _.get(result, '0.mergeCells', []),
        columns: _.get(result, '0.columns', [])
      });
    });

  }

  setHeight() {
    this.setState({height: document.documentElement.clientHeight - this.grid.current.getBoundingClientRect().top});
  }

  render() {
    let {height} = this.state;

    return <div className="container-fluid">
      <div className="row my-1 align-items-center">
        <div className="col-lg-4 col-sm">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <FontAwesomeIcon icon="search"/>
              </span>
            </div>
            <input type="text" placeholder="Search" ref={this.search} className="form-control"/>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <div id="grid" ref={this.grid} style={{overflow: 'hidden', height}}/>
        </div>
      </div>
    </div>;
  }
}

TableBody.propTypes = {
  result: PropTypes.arrayOf(PropTypes.object)
};

const Table = connect(mapStateToProps)(TableBody);

export default Table;
