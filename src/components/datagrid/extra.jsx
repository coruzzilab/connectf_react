/**
 * @author zacharyjuang
 * 2/10/17
 */
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {BASE_URL} from '../../actions';

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
      <a href={`${BASE_URL}/queryapp/excel/${requestId}.zip`}
         className="btn btn-default"
         download="query.zip">Download Query as ZIP file</a>
    </div>;
  }
}

ExtraBody.propTypes = {
  requestId: PropTypes.string
};

const Extra = connect(mapStateToProps)(ExtraBody);

export default Extra;
