/**
 * @author zacharyjuang
 * 9/16/19
 */
import React from 'react';
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {getTFs} from "../../utils/axios_instance";
import _ from 'lodash';
import {setQuery} from "../../actions";

class RandomButtonBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tfs: []
    };
  }

  componentDidMount() {
    getTFs({all: 0}).then(({data}) => {
      this.setState({
        tfs: _.map(data, 'value')
      });
    });
  }

  clickRandom() {
    let {tfs} = this.state;
    let query = _.sortBy(_.sampleSize(tfs, _.sample(_.range(1, 6)))).join(' or ');
    this.props.setQuery(query);
  }

  render() {
    let {tfs} = this.state;

    return <button type="button"
                   className={classNames("btn", tfs.length ? "btn-primary" : "btn-outline-primary")}
                   onClick={this.clickRandom.bind(this)}>
      <Icon icon="arrow-circle-right"/> Randomize
    </button>;
  }
}

RandomButtonBody.propTypes = {
  setQuery: PropTypes.func,
  history: PropTypes.object
};

const RandomButton = withRouter(connect(null, {setQuery})(RandomButtonBody));

export default RandomButton;
