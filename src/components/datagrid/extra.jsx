/**
 * @author zacharyjuang
 * 2/10/17
 */
import React from 'react';
import {connect} from 'react-redux';

const mapStateToProps = (state) => {
  return {
    requestId: state.requestId
  };
};

class ExtraBody extends React.Component {
  render() {
    let {requestId} = this.props;

    // @todo: use proper urls later
    return <div>
      <a href={`http://coruzzilab-macpro.bio.nyu.edu/static/queryBuilder/${requestId}.zip`}
         className="btn btn-default">Download</a>
    </div>;
  }
}

ExtraBody.propTypes = {
  requestId: React.PropTypes.string
};

const Extra = connect(mapStateToProps)(ExtraBody);

export default Extra;
