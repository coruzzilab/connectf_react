/**
 * @author zacharyjuang
 * 2019-02-15
 */
import React from "react";
import _ from "lodash";
import {getQuery} from "../../utils";
import {CopyButton} from "../common";
import {Copied} from "./common";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import QueryAutocomplete from "./query_autocomplete";
import {connect} from "react-redux";
import {setQuery} from "../../actions";
import PropTypes from "prop-types";

function mapStateToProps({busy, query, queryTree, queryError}) {
  return {
    busy,
    query,
    queryTree,
    queryError
  };
}

class QueryBoxBody extends React.Component {
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
    let {query, busy, queryError, setQuery, reset} = this.props;
    let {shouldBuild} = this.state;

    return <div className="form-row">
      <div className="col m-2">
        <div className="input-group">
          <div className="input-group-prepend">
            <CopyButton text={query} className="btn-lg" content={Copied}/>
            <button type="button"
                    className={classNames("btn btn-lg", shouldBuild ? "btn-warning" : "btn-secondary")}
                    onClick={this.setQuery.bind(this)}>
              <FontAwesomeIcon icon="edit" className="mr-1"/>Build Query
            </button>
          </div>
          <QueryAutocomplete value={query} setQuery={setQuery}/>
          <div className="input-group-append">
            {busy ?
              <button type="submit" className="btn btn-warning btn-lg" id="submit">
                <FontAwesomeIcon icon="circle-notch" spin size="lg" className="mr-2"/>Querying
              </button> :
              <button type="submit" id="submit"
                      className={classNames("btn btn-lg", queryError.error ? "btn-danger" : "btn-primary")}>
                <FontAwesomeIcon icon="arrow-circle-up" className="mr-2"/>Submit
              </button>}
            <button type="button" className="btn btn-outline-danger btn-lg" onClick={reset}>
              <FontAwesomeIcon icon="redo" className="mr-2"/>Reset
            </button>
          </div>
        </div>
      </div>
    </div>;
  }
}

QueryBoxBody.propTypes = {
  busy: PropTypes.number,
  query: PropTypes.string,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  setQuery: PropTypes.func,
  queryError: PropTypes.shape({error: PropTypes.bool, message: PropTypes.string}),
  reset: PropTypes.func
};

const QueryBox = connect(
  mapStateToProps,
  {setQuery}
)(QueryBoxBody);

QueryBox.propTypes = {
  reset: PropTypes.func.isRequired
};

export default QueryBox;
