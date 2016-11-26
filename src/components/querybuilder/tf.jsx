/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import {connect} from 'react-redux';

class TF extends React.Component {
  render() {
    return <div>
      <h5>TFs</h5>
      <div>
        <div className="container col-xs-4 col-sm-4 col-md-4 col-lg-4" style={{float: "left", width: "100%"}}>
          Missing Tree structure
        </div>
      </div>
      <div className="col-xs-10 col-sm-10 col-md-10 col-lg-10 form-group">
        <textarea name="expr" id="input" className="form-control" rows="5" style={{width: "100%"}}/>
        <button type="button" className="btn btn-default" onClick={this.props.createQuery}>Create Query</button>
      </div>
    </div>;
  }
}

TF.propTypes = {
  createQuery: React.PropTypes.func.isRequired
};

export default connect()(TF);
