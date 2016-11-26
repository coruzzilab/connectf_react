/**
 * Created by zacharyjuang on 11/24/16.
 */
import React from 'react';
import {connect} from 'react-redux';
import {push} from 'react-router-redux';

import TF from './tf';

const mapDispatchToProps = (dispatch) => {
  return {
    submit: () => {
      dispatch(push('/datagrid'));
    }
  };
};

class Querybuilder extends React.Component {
  render() {
    return <div style={{display: "flex", flexDirection: "row"}}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 90
      }}>
        <TF/>
      </div>

      <div style={{flex: 20}}>
        <button type="button" className="btn btn-default" onClick={this.props.submit}>Submit</button>
      </div>
    </div>;
  }
}

export default connect(undefined, mapDispatchToProps)(Querybuilder);
