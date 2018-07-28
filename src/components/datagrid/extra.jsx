/**
 * @author zacharyjuang
 * 2/10/17
 */
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';
import {BASE_URL} from '../../actions';

const mapStateToProps = ({requestId}) => {
  return {
    requestId
  };
};

class ExtraBody extends React.Component {
  render() {
    let {requestId} = this.props;

    return <div>
      <a href={`${BASE_URL}/queryapp/export/${requestId}.zip`}
         className="btn btn-primary"
         target="_blank" rel="noopener noreferrer"
         download="query.zip"><Icon icon="file-archive" className="mr-1"/>Download Query as ZIP file</a>
    </div>;
  }
}

ExtraBody.propTypes = {
  requestId: PropTypes.string
};

const Extra = connect(mapStateToProps)(ExtraBody);

export default Extra;
