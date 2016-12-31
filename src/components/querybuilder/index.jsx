/**
 * Created by zacharyjuang on 11/24/16.
 */
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';

import {resetTree} from '../../actions';

import TF from './tf';
import Edge from './edge';
import Meta from './meta';

const mapStateToProps = (state) => {
  return {
    busy: state.busy
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    submit: () => {
      dispatch(push('/datagrid'));
      // dispatch(resetTree("TF"));
      // dispatch(resetTree("EDGE"));
      // dispatch(resetTree("META"));
    }
  };
};

/**
 * Builds queries for tgdbbackend
 */
class QuerybuilderBody extends React.Component {
  render() {
    return <div style={{display: "flex", flexDirection: "row"}}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 90
      }}>
        <TF/>
        <Edge/>
        <Meta/>

        <label className="col-sm-2">TargetGenes</label>
        <input type="file" className="form-control"/>
      </div>

      <div style={{flex: 20}}>
        <button type="button" className="btn btn-default" onClick={this.props.submit}>Submit</button>
      </div>
    </div>;
  }
}

/**
 * @memberOf QuerybuilderBody
 * @type {{busy: *, submit: (*)}}
 */
QuerybuilderBody.propTypes = {
  busy: React.PropTypes.bool,
  submit: React.PropTypes.func.isRequired
};

const Querybuilder = connect(mapStateToProps, mapDispatchToProps)(QuerybuilderBody);

export default Querybuilder;
