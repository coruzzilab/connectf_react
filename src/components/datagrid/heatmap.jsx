/**
 * @author zacharyjuang
 * 6/24/17
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {BASE_URL} from '../../actions';

const mapStateToProps = (state) => {
  return {
    requestId: state.requestId
  };
};

class HeatMapBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      success: true
    };
  }

  render() {
    let {requestId} = this.props;
    let {success} = this.state;
    return <div>
      {success ?
        <img src={`${BASE_URL}/queryapp/heatmap/${requestId}.svg`}
             alt="heatmap"
             onError={() => {
               this.setState({
                 success: false
               });
             }}/> :
        <div>Heatmap is not available for this query.</div>}
    </div>;
  }
}

HeatMapBody.propTypes = {
  requestId: PropTypes.string
};

const HeatMap = connect(mapStateToProps)(HeatMapBody);

export default HeatMap;

