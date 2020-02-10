/**
 * @author zacharyjuang
 * 2/5/17
 */
import React from 'react';
import {connect} from 'react-redux';
import Handsontable from '../../utils/handsontable';
import _ from 'lodash';
import PropTypes from 'prop-types';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';

let mapStateToProps = ({result}) => {
  return {
    result
  };
};

const prepareMetadataCsv = (metadata) => {
  let result = "";
  let ids = _.map(_.get(metadata, 'columns', []), (c) => c.id);
  let rows = _.map(_.get(metadata, 'data', []), (r) => _.map(ids, (i) => r[i]));

  result += _(ids).map((i) => `"${i}"`).join(",") + "\n";
  result += _(rows).map((row) => _(row).map((r) => `"${r}"`).join(",")).join("\n") + "\n";

  return result;
};

export class MetaBody extends React.Component {
  constructor(props) {
    super(props);
    this.search = React.createRef();
    this.grid = React.createRef();

    this.state = {
      height: Math.floor(document.documentElement.clientHeight * 0.8)
    };
  }

  componentDidMount() {
    let {result} = this.props;

    let hot = this.hot = new Handsontable(this.grid.current, {
      licenseKey: 'non-commercial-and-evaluation',
      readOnly: true,
      readOnlyCellClassName: 'foobar',  // @todo: placeholder class until bug is fixed
      rowHeaders: true,
      manualColumnResize: true,
      colHeaders: _.map(_.get(result, 'metadata.columns', []), 'name'),
      columns: _.map(_.get(result, 'metadata.columns', []), (c) => {
        return {
          data: c.id,
          editor: false
        };
      }),
      columnSorting: true,
      data: _.values(_.get(result, 'metadata.data', {})),
      search: true
    });

    Handsontable.dom.addEvent(this.search.current, 'keyup', _.debounce(function (event) {
      let search = hot.getPlugin('search');
      search.query(this.value);

      hot.render();
    }, 100));
  }

  componentDidUpdate(prevProps) {
    let {result} = this.props;

    if (result !== prevProps.result) {
      this.hot.updateSettings({
        columns: _.map(_.get(result, 'metadata.columns', []), (c) => {
          return {
            data: c.id,
            editor: false
          };
        })
      });

      this.hot.loadData(_.values(_.get(result, 'metadata.data', {})));
    }
  }

  componentWillUnmount() {
    this.hot.destroy();
  }

  generateMetadata() {
    let a = document.createElement('a');
    a.href = "data:text/csv," + encodeURIComponent(prepareMetadataCsv(_.get(this.props, "result.metadata")));
    a.download = "metadata.csv";
    document.body.append(a);
    a.click();
    a.remove();
  }

  render() {
    return <div className="container-fluid">
      <div className="row my-1">
        <div className="col-4">
          <div className="input-group">
            <div className="input-group-prepend">
              <span className="input-group-text">
                <Icon icon="search"/>
              </span>
            </div>
            <input type="text" placeholder="Search" ref={this.search} className="form-control"/>
          </div>
        </div>
        <div className="col-8">
          <button type="button" className="btn btn-primary float-right"
                  onClick={this.generateMetadata.bind(this)}>
            <Icon icon="table" className="mr-1"/>Export Metadata
          </button>
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

MetaBody.propTypes = {
  result: PropTypes.object
};

const Meta = connect(mapStateToProps)(MetaBody);

export default Meta;
