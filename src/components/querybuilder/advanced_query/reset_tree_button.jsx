/**
 * @author zacharyjuang
 * 3/29/20
 */
import React from "react";
import {connect} from "react-redux";
import PropTypes from "prop-types";
import {clearQueryTree} from "../../../actions";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";

const ResetTreeButtonBody = ({clearQueryTree}) => {
  return <button type="button" className="btn btn-outline-danger" onClick={clearQueryTree}>
    <Icon icon="trash-alt" className="mr-1"/>Clear
  </button>;
};

ResetTreeButtonBody.propTypes = {
  clearQueryTree: PropTypes.func
};

const ResetTreeButton = connect(null, {clearQueryTree})(ResetTreeButtonBody);

export default ResetTreeButton;
