/**
 * @author zacharyjuang
 * 1/28/17
 */
import React from 'react';
import Handsontable from 'handsontable/dist/handsontable.full';
import {connect} from 'react-redux';
import _ from 'lodash';

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
  }
}

class DFBody extends React.Component {
  componentDidMount() {
    let {result} = this.props;

    let hot = this.hot = new Handsontable(this.refs.grid, {
      rowHeaders: true,
      manualColumnResize: true,
      colHeaders: _.map(result[0].columns, 'name'),
      columns: _.map(result[0].columns, (c) => {
        return {
          data: c.id,
          editor: false
        };
      }),
      columnSorting: true,
      fixedRowsTop: 3,
      cells: function (row, col, prop) {
        let cellProperties = {};
        if (col > 8 && row > 2) {
          cellProperties.renderer = renderInduced;
        }

        return cellProperties;
      },
      search: true,
      sortIndicator: true,
      sortFunction: function (sortOrder, columnMeta) {
        return function (a, b) {
          let plugin = hot.getPlugin('columnSorting');

          if (a[0] < 3) {
            if (a[0] > b[0]) {
              return 1;
            }
            return -1;
          }
          if (b[0] < 3) {
            if (a[0] < b[0]) {
              return -1;
            }
            return 1;
          }

          return plugin.defaultSort(sortOrder, columnMeta)([a[0], a[1].replace(NON_ALPHANUMERIC, '')],
            [b[0], b[1].replace(NON_ALPHANUMERIC, '')]);
        };
      }
    });

    Handsontable.Dom.addEvent(this.refs.search, 'keyup', function (event) {
      hot.search.query(this.value);
      hot.render();
    });

    hot.loadData(_.values(JSON.parse(result[0].data)));
  }

  render() {
    // @todo: find someone who actually knows CSS
    return <div>
      <input type="text" placeholder="Search" ref="search"/>
      <div id="grid" ref="grid" style={{height: '100vh'}}/>
    </div>;
  }
}

DFBody.propTypes = {
  result: React.PropTypes.arrayOf(React.PropTypes.object)
};

const DF = connect(mapStateToProps)(DFBody);

export default DF;
