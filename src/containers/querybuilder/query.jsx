/**
 * @author zacharyjuang
 * 12/6/16
 */
import React from 'react';

class Query extends React.Component {
  render() {
    let {tree, title, query, setQuery, createQuery} = this.props;
    return <div>
      {title}
      <div>
        <div className="container col-xs-4 col-sm-4 col-md-4 col-lg-4" style={{float: "left", width: "100%"}}>
          {tree}
        </div>
      </div>
      <div className="col-xs-10 col-sm-10 col-md-10 col-lg-10 form-group">
        <textarea name="expr" id="input" className="form-control" rows="5" style={{width: "100%"}}
                  onChange={setQuery} value={query}/>
        <button type="button" className="btn btn-default" onClick={createQuery}>Create Query</button>
      </div>
    </div>;
  }
}

Query.propTypes = {
  tree: React.PropTypes.node,
  title: React.PropTypes.node,
  query: React.PropTypes.string.isRequired,
  setQuery: React.PropTypes.func.isRequired,
  createQuery: React.PropTypes.func
};

export default Query;
