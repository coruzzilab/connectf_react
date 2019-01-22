/**
 * @author zacharyjuang
 * 11/13/18
 */
import React from "react";
import {connect} from "react-redux";
import _ from "lodash";
import {Collapse, DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {ExtraFields} from "../common";
import {RowHeader} from "./common";
import {columnString} from "../../../utils";
import PropTypes from "prop-types";

function mapStateToProps({busy, extraFields}) {
  return {
    busy,
    extraFields
  };
}

class EnrichmentTableBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapse: false
    };
  }

  toggle() {
    this.setState({collapse: !this.state.collapse});
  }

  render() {
    let {busy, className, data} = this.props;
    let {collapse} = this.state;

    let extraFieldNames = _(data.info).map(1).map(_.keys).flatten().uniq().sortBy().value();
    let extraFields = _.intersection(this.props.extraFields, extraFieldNames);

    return <div className={className}>
      <div className="row my-2">
        <div className="col d-flex flex-row-reverse align-items-center">
          <UncontrolledDropdown>
            <DropdownToggle caret className="ml-1" color="primary">
              <FontAwesomeIcon icon="file-download" className="mr-1"/>Export
            </DropdownToggle>
            <DropdownMenu>
              <DropdownItem header>Format (CSV)</DropdownItem>
              <DropdownItem>As Matrix</DropdownItem>
              <DropdownItem>As Columns</DropdownItem>
            </DropdownMenu>
          </UncontrolledDropdown>
          <button type="button" className="btn btn-primary ml-1" onClick={this.toggle.bind(this)}>
            <FontAwesomeIcon icon="cog" className="mr-1"/>Options
          </button>
          {busy ? <FontAwesomeIcon icon="circle-notch" spin size="lg"/> : null}
        </div>
      </div>
      <Collapse isOpen={collapse}>
        <div className="row">
          <ExtraFields extraFieldNames={extraFieldNames} className="col border rounded m-2"/>
        </div>
      </Collapse>
      <div className="row">
        <div className="col">
          <div className="table-responsive">
            <table className="table">
              <thead>
              <tr>
                <th>Index</th>
                <th>Gene</th>
                <th>Filter</th>
                <th>Analysis ID</th>
                {_.map(extraFields, (e, i) => <th key={i}>{e}</th>)}
              </tr>
              </thead>
              <tbody>
              {_.map(data.info, (info, i) => {
                return <tr key={i}>
                  <RowHeader info={info}>{columnString(i + 1)}</RowHeader>
                  {_.map(info[0], (c, j) => <td key={j}>{c}</td>)}
                  {_(info[1]).pick(extraFields).values().map((e, j) => <td key={j}>{e}</td>).value()}
                </tr>;
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>;
  }
}

EnrichmentTableBody.propTypes = {
  busy: PropTypes.number,
  data: PropTypes.object,
  className: PropTypes.string,
  extraFields: PropTypes.arrayOf(PropTypes.string)
};

EnrichmentTableBody.defaultProps = {
  extraFields: []
};

const EnrichmentTable = connect(mapStateToProps)(EnrichmentTableBody);

EnrichmentTable.propTypes = {
  data: PropTypes.object.isRequired,
  className: PropTypes.string
};

export default EnrichmentTable;
