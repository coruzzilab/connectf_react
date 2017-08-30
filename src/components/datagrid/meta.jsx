/**
 * @author zacharyjuang
 * 2/5/17
 */
import React from 'react';
import {connect} from 'react-redux';
import Handsontable from 'handsontable/dist/handsontable.full';
import _ from 'lodash';
import PropTypes from 'prop-types';

let mapStateToProps = (state) => {
  return {
    result: state.result
  };
};

export class MetaBody extends React.Component {
  componentDidMount() {
    let {result} = this.props;

    let hot = this.hot = new Handsontable(this.grid, {
      rowHeaders: true,
      manualColumnResize: true,
      colHeaders: _.map(_.get(result, '1.columns', []), 'name'),
      columns: _.map(_.get(result, '1.columns', []), (c) => {
        return {
          data: c.id,
          editor: false
        };
      }),
      columnSorting: true,
      data: _.values(JSON.parse(_.get(result, '1.data', "{}"))),
      sortIndicator: true,
      search: true
    });

    Handsontable.dom.addEvent(this.search, 'keyup', function (event) {
      hot.search.query(this.value);
      hot.render();
    });
  }

  componentDidUpdate() {
    let {result} = this.props;

    this.hot.updateSettings({
      columns: _.map(_.get(result, '1.columns', []), (c) => {
        return {
          data: c.id,
          editor: false
        };
      })
    });

    this.hot.loadData(_.values(JSON.parse(_.get(result, '1.data', "{}"))));
  }

  render() {
    return <div>
      <input type="text" ref={(c) => {this.search = c}} placeholder="Search"/>
      <div ref={(c) => {this.grid = c}} style={{height: '80vh', width: '100vw'}}/>
    </div>;
  }
}

MetaBody.propTypes = {
  result: PropTypes.arrayOf(PropTypes.object)
};

const Meta = connect(mapStateToProps)(MetaBody);

export default Meta;
