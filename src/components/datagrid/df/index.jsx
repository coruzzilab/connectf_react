/**
 * @author zacharyjuang
 * 1/28/17
 */
import React from 'react';
import Handsontable from 'handsontable';
import 'handsontable/dist/handsontable.full.css';
import './multicolumn_sort';
import {connect} from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';

import Reorder from './reorder';

const NON_ALPHANUMERIC = /^\W*|\W*$/g;

let mapStateToProps = (state) => {
  return {
    result: state.result,
    busy: state.busy
  };
};

function renderTarget(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  if (_.isString(value)) {
    if (value.startsWith('INDUCED')) {
      td.style.background = 'lightgreen';
    } else if (value.startsWith('REPRESSED')) {
      td.style.background = 'lightcoral';
    }
    if (value === 'Present') {
      td.style.background = '#F6DB77';
    }
  }
}

function renderBold(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  td.style.fontWeight = 'bold';
  td.style.border = '1px solid black';
  td.style.borderCollapse = 'collapse';
}

function renderNumber(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.NumericRenderer.apply(this, arguments);
  if (_.isFinite(value)) {
    let svalue = value.toString();
    let isExp = svalue.indexOf("e") !== -1;

    if ((!isExp && svalue.length > 5) || (isExp && svalue.length > 9)) {
      td.textContent = value.toExponential(2);
    } else {
      td.textContent = value;
    }
  }
}

Handsontable.renderers.registerRenderer('renderBold', renderBold);
Handsontable.renderers.registerRenderer('renderTarget', renderTarget);
Handsontable.renderers.registerRenderer('renderNumber', renderNumber);

function exponentialValidator(value, callback) {
  if (value == null) {
    value = '';
  }
  if (this.allowEmpty && value === '') {
    callback(true);

  } else if (value === '') {
    callback(false);

  } else {
    callback(/^-?\d+(\.\d+)?(e[+-]\d+)?$/.test(value));
  }
}

Handsontable.validators.registerValidator('exponential', exponentialValidator);

Handsontable.cellTypes.registerCellType('p_value', {
  renderer: 'renderNumber',
  validator: 'exponentialValidator',
});

let queryString = Handsontable.plugins.Search.DEFAULT_QUERY_METHOD;

class DFBody extends React.Component {
  componentDidMount() {
    let self = this;
    let hot = this.hot = new Handsontable(this.grid, {
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
        }

        if (col < 4) {
          cellProperties.colWidths = 200;
        }

        if (col > 7) {
          cellProperties.colWidths = 115;
        }

        return cellProperties;
      },
      search: true,
      sortIndicator: true,
      sortFunction: function (sortOrder, columnMeta) {
        let skippedRows = 6;

        return function (a, b) {
          let plugin = hot.getPlugin('columnSorting');

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

          return plugin.defaultSort(sortOrder, columnMeta)(
            [a[0], _.isString(a[1]) ? a[1].replace(NON_ALPHANUMERIC, '') : a[1]],
            [b[0], _.isString(b[1]) ? b[1].replace(NON_ALPHANUMERIC, '') : b[1]]);
        };
      }
    });

    hot.addHook('afterOnCellMouseDown', function (event, {row, col}) {
      if (row === -1) {
        hot.sort(col);
      }
    });

    Handsontable.dom.addEvent(this.search, 'keyup', function () {
      let {data} = self;
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
    });

    this.updateData();
  }

  componentDidUpdate() {
    this.updateData();
  }

  componentWillUnmount() {
    this.hot.destroy();
  }

  updateData() {
    let {result} = this.props;
    let data = this.data = _.get(result, '0.data', []);
    this.hot.updateSettings({
      mergeCells: _.get(result, '0.mergeCells', []),
      columns: _.get(result, '0.columns', [])
    });
    this.hot.loadData(data);
  }

  render() {
    let {busy} = this.props;
    // @todo: find someone who actually knows CSS
    return <div>
      <div>
        <input type="text" placeholder="Search" ref={(c) => {
          this.search = c;
        }} style={{float: 'left'}}/>
        {busy ? <span className="fa fa-circle-o-notch fa-spin" style={{fontSize: '21px'}}/> : null}
      </div>
      <div id="grid" ref={(c) => {
        this.grid = c;
      }} style={{height: '80vh', overflow: 'hidden', clear: 'both'}}/>
    </div>;
  }
}

DFBody.propTypes = {
  result: PropTypes.arrayOf(PropTypes.object),
  busy: PropTypes.bool
};

const DF = connect(mapStateToProps)(DFBody);

export default DF;
