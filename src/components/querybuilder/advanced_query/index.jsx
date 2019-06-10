import React from "react";
import {connect} from "react-redux";
import {PopoverBody, PopoverHeader} from "reactstrap";
import {AddTFButton, AddTFGroupButton} from "../common";
import BuildQueryButton from "../build_query_button";
import QueryTree from "../query_tree";
import {addGroup, addTF} from '../../../actions';
import PropTypes from "prop-types";
import {InfoPopover} from "../../common";

import info from "./info.txt";

const AdvancedQueryInfo = () => {
  return <InfoPopover>
    <PopoverHeader>Advanced Query</PopoverHeader>
    <PopoverBody>{info}</PopoverBody>
  </InfoPopover>;
};

class AdvancedQueryBody extends React.Component {
  render() {
    let {addTF, addGroup} = this.props;

    return <div className="row">
      <div className="col">
        <div className="row m-2 align-items-center">
          <h4>Advanced Search</h4>
          <AdvancedQueryInfo/>
        </div>
        <div className="row m-2">
          <div className="col p-0">
            <div className="form-row">
              <div className="col p-0">
                <div className="btn-group mr-2">
                  <AddTFButton
                    onClick={addTF.bind(undefined, '', undefined, undefined, undefined, undefined)}/>
                  <AddTFGroupButton
                    onClick={addGroup.bind(undefined, undefined, undefined, undefined, undefined)}/>
                </div>
                <div className="btn-group">
                  <BuildQueryButton/>
                </div>
              </div>
            </div>

            <QueryTree/>
          </div>
        </div>
      </div>
    </div>;
  }
}

AdvancedQueryBody.propTypes = {
  addTF: PropTypes.func,
  addGroup: PropTypes.func
};

const AdvancedQuery = connect(null, {addTF, addGroup})(AdvancedQueryBody);

export default AdvancedQuery;
