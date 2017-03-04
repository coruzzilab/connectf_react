/**
 * @author zacharyjuang
 * 2/5/17
 */
import React from 'react';
import {connect} from 'react-redux';
import Handsontable from 'handsontable/dist/handsontable.full';
import _ from 'lodash';

let mapStateToProps = (state) => {
  return {
    result: state.result
  };
};

export class MetaBody extends React.Component {
  componentDidMount() {
    let {result} = this.props;

    let hot = new Handsontable(this.refs.grid, {
      rowHeaders: true,
      manualColumnResize: true,
      colHeaders: _.map(result[1].columns, 'name'),
      columns: _.map(result[1].columns, (c) => {
        return {
          data: c.id,
          editor: false
        };
      }),
      columnSorting: true,
      data: _.values(JSON.parse(result[1].data)),
      sortIndicator: true,
      search: true
    });

    Handsontable.Dom.addEvent(this.refs.search, 'keyup', function (event) {
      hot.search.query(this.value);
      hot.render();
    });
  }

  render() {
    return <div>
      <input type="text" ref="search" placeholder="Search"/>
      <div ref="grid" style={{height: '100vh', width: '100vw'}}/>
    </div>;
  }
}

MetaBody.propTypes = {
  result: React.PropTypes.arrayOf(React.PropTypes.object)
};

const Meta = connect(mapStateToProps)(MetaBody);

export default Meta;
