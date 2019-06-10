import React from "react";
import _ from "lodash";
import {getQuery} from "../../utils";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {setQuery} from "../../actions";

function mapStateToProps({query, queryTree}) {
  return {
    query,
    queryTree
  };
}

class BuildQueryButtonBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      shouldBuild: false
    };

    this.checkShouldBuild = _.debounce(this.checkShouldBuild.bind(this), 100);
  }

  componentDidMount() {
    this.checkShouldBuild();
  }

  componentDidUpdate(prevProps) {
    if (this.props.query !== prevProps.query || !_.isEqual(this.props.queryTree, prevProps.queryTree)) {
      this.checkShouldBuild();
    }
  }

  checkShouldBuild() {
    let query = getQuery(this.props.queryTree);

    this.setState({
      shouldBuild: query && this.props.query !== query
    });
  }

  setQuery() {
    this.props.setQuery(getQuery(this.props.queryTree));
  }

  render() {
    let {shouldBuild} = this.state;

    return <button type="button"
                   className={classNames("btn", shouldBuild ? "btn-warning" : "btn-secondary")}
                   onClick={this.setQuery.bind(this)}>
      <FontAwesomeIcon icon="edit" className="mr-1"/>Build Query
    </button>;
  }
}

BuildQueryButtonBody.propTypes = {
  query: PropTypes.string,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  setQuery: PropTypes.func,
  reset: PropTypes.func
};

const BuildQueryButton = connect(mapStateToProps, {setQuery})(BuildQueryButtonBody);

export default BuildQueryButton;
