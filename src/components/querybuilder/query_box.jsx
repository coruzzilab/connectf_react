/**
 * @author zacharyjuang
 * 2019-02-15
 */
import React, {useEffect, useState} from 'react';
import {CopyButton} from "../common";
import {Copied} from "./common";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import AutoComplete from "../common/autocomplete";
import {connect} from "react-redux";
import {setQuery} from "../../actions";
import PropTypes from "prop-types";
import {getTFs} from "../../utils/axios_instance";

function mapStateToProps({busy, query, queryError}) {
  return {
    busy,
    query,
    queryError
  };
}

const renderItem = (item) => {
  if (item.name) {
    return <div>{item.value} <span className="text-secondary">{item.name}</span></div>;
  }
  return item.value;
};

// class QueryBoxBody extends React.Component {
const QueryBoxBody = ({query, busy, queryError, setQuery, reset, className}) => {
    // let {query, busy, queryError, reset, className} = this.props; //setQuery
    let [genes, setGenes] = useState([]);
    let [value, setValue] = useState(query);
  
    useEffect(() => {
      getTFs({all: 0}).then(({data}) => {
        setGenes(data);
      });
    }, []);

    return (
      <div className={classNames("form-row mx-1 my-2", className)}>
        <div className="col">
          <div className="input-group">
            <div className="input-group-prepend">
              <CopyButton text={query} className="btn-lg" content={Copied}/>
            </div>
            <AutoComplete value={value}
              items={genes}
              onChange={(e) => {
                setValue(e.target.value);
                setQuery(e.target.value);
              }}
              mapItemToValue={(o) => o.value}
              mapItemToSearch={(o) => o.name + o.value}
              renderItem={renderItem}
              inputProps={{
                placeholder: 'Search Transcription Factor...',
                type: "text",
                required: true
              }}
              className="form-control p-0"
            />
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
      </div>
    )
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
