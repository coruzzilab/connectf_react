/**
 * @author zacharyjuang
 * 2019-02-15
 */
import React from "react";
import {CopyButton} from "../common";
import {Copied} from "./common";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AutoComplete from "../common/autocomplete";
import {connect} from "react-redux";
import {setQuery} from "../../actions";
import PropTypes from "prop-types";

function mapStateToProps({busy, query, queryError}) {
  return {
    busy,
    query,
    queryError
  };
}

class QueryBoxBody extends React.Component {
  render() {
    let {query, busy, queryError, reset, className} = this.props; //setQuery

    return <div className={classNames("form-row mx-1 my-2", className)}>
      <div className="col">
        <div className="input-group">
          <div className="input-group-prepend">
            <CopyButton text={query} className="btn-lg" content={Copied}/>
          </div>
          <AutoComplete value={query} onChange={setQuery}/>
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
  setQuery: PropTypes.func,
  queryError: PropTypes.shape({error: PropTypes.bool, message: PropTypes.string}),
  reset: PropTypes.func,
  className: PropTypes.string
};

const QueryBox = connect(
  mapStateToProps,
  {setQuery}
)(QueryBoxBody);

QueryBox.propTypes = {
  reset: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default QueryBox;
