/**
 * @author zacharyjuang
 * 1/28/17
 */
import React from 'react';
import Handsontable from 'handsontable/dist/handsontable.full';
import {connect} from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';

const NON_ALPHANUMERIC = /^\W*|\W*$/g;

let mapStateToProps = (state) => {
  return {
    result: state.result
  };
};

function renderInduced(instance, td, row, col, prop, value, cellProperties) {
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

let queryString = Handsontable.plugins.Search.DEFAULT_QUERY_METHOD;

class DFBody extends React.Component {
  componentDidMount() {
    let {result} = this.props;
    let data = this.data = _.get(result, '0.data', []);

    let hot = this.hot = new Handsontable(this.grid, {
      rowHeaders: true,
      manualColumnResize: true,
      columnSorting: true,
      colHeaders: true,
      fixedRowsTop: 6,
      wordWrap: false,
      mergeCells: _.get(result, '0.mergeCells', []),
      cells: function (row, col, prop) {
        let cellProperties = {...prop};
        if (col > 8 && row > 5) {
          cellProperties.renderer = renderInduced;
        }

        if (col > 8 && row < 6) {
          cellProperties.className = "htCenter";
        }

        if (row < 7) {
          cellProperties.type = 'text';
        }

        if (col < 5) {
          cellProperties.colWidths = 200;
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

    Handsontable.dom.addEvent(this.search, 'keyup', function (event) {
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

    hot.loadData(data);
  }

  render() {
    // @todo: find someone who actually knows CSS
    return <div>
      <input type="text" placeholder="Search" ref={(c) => {
        this.search = c;
      }}/>
      <div id="grid" ref={(c) => {
        this.grid = c;
      }} style={{height: '80vh'}}/>
    </div>;
  }
}

DFBody.propTypes = {
  result: PropTypes.arrayOf(PropTypes.object)
};

const DF = connect(mapStateToProps)(DFBody);

export default DF;
