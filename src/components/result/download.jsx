/**
 * @author zacharyjuang
 * 2/10/17
 */
import React from 'react';
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';
import {BASE_URL} from '../../utils/axios_instance';

const mapStateToProps = ({requestId}) => {
  return {
    requestId
  };
};

class ExtraBody extends React.Component {
  render() {
    let {requestId} = this.props;

    return <div className="container-fluid">
      <div className="row">
        <div className="col">
          <h3>Export</h3>
          <p>Generates SIF files and Excel sheets for current query.</p>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <a href={`${BASE_URL}/api/export/${requestId}.zip`}
             className="btn btn-primary"
             target="_blank" rel="noopener noreferrer"
             download="query.zip"><Icon icon="file-archive" className="mr-1"/>Download Query as ZIP file</a>
        </div>
      </div>
    </div>;
  }
}

ExtraBody.propTypes = {
  requestId: PropTypes.string
};

const Download = connect(mapStateToProps)(ExtraBody);

export default Download;
