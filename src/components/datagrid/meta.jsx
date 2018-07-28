/**
 * @author zacharyjuang
 * 2/5/17
 */
import React from 'react';
import {connect} from 'react-redux';
import Handsontable from 'handsontable/dist/handsontable.full';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

let mapStateToProps = ({result}) => {
  return {
    result
  };
};

export class MetaBody extends React.Component {
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
    let {result} = this.props;

    let hot = this.hot = new Handsontable(this.grid.current, {
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
      data: _.values(_.get(result, '1.data', {})),
      sortIndicator: true,
      search: true
    });

    Handsontable.dom.addEvent(this.search.current, 'keyup', _.debounce(function (event) {
      let search = hot.getPlugin('search');
      search.query(this.value);

      hot.render();
    }, 100));

    this.setHeight();
    window.addEventListener("resize", this.setHeight);
  }

  componentDidUpdate(prevProps) {
    let {result} = this.props;

    if (result !== prevProps.result) {
      this.hot.updateSettings({
        columns: _.map(_.get(result, '1.columns', []), (c) => {
          return {
            data: c.id,
            editor: false
          };
        })
      });

      this.hot.loadData(_.values(_.get(result, '1.data', {})));
    }
  }

  componentWillUnmount() {
    this.hot.destroy();
    window.removeEventListener("resize", this.setHeight);
  }

  setHeight() {
    this.setState({height: document.documentElement.clientHeight - this.grid.current.offsetTop});
  }

  render() {
    let {height} = this.state;

    return <div className="container-fluid">
      <div className="row my-1">
        <div className="col-4">
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
          <div ref={this.grid} style={{overflow: 'hidden', height}}/>
        </div>
      </div>
    </div>;
  }
}

MetaBody.propTypes = {
  result: PropTypes.arrayOf(PropTypes.object)
};

const Meta = connect(mapStateToProps)(MetaBody);

export default Meta;
