/**
 * @author zacharyjuang
 * 8/25/18
 */
import React from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown} from "reactstrap";
import _ from "lodash";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {clearQueryHistory, setQuery} from "../../actions";

function mapStateToProps({queryHistory}) {
  return {
    queryHistory
  };
}

class HistoryBody extends React.Component {
  render() {
    let {queryHistory, setQuery, clearQueryHistory} = this.props;
    return <UncontrolledDropdown>
      <DropdownToggle className="btn btn-secondary">
        <FontAwesomeIcon icon="history" className="mr-1"/>Query History
      </DropdownToggle>
      <DropdownMenu right
                    modifiers={{
                      setMaxHeight: {
                        enabled: true,
                        order: 890,
                        fn: (data) => {
                          return {
                            ...data,
                            styles: {
                              ...data.styles,
                              overflow: 'auto',
                              maxHeight: '70vh'
                            }
                          };
                        }
                      }
                    }}>
        {queryHistory.length ?
          _.map(queryHistory, (h, i) => {
            return <DropdownItem key={i}
                                 onClick={setQuery.bind(undefined, h.query)}>
              <div>{h.query}</div>
              <div className="text-secondary">
                <small>{h.time}</small>
              </div>
            </DropdownItem>;
          }) :
          <DropdownItem disabled>No History</DropdownItem>}
        <DropdownItem divider/>
        <DropdownItem onClick={clearQueryHistory}><FontAwesomeIcon icon="trash-alt"/> Clear</DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>;
  }
}

HistoryBody.propTypes = {
  queryHistory: PropTypes.arrayOf(PropTypes.shape({query: PropTypes.string, time: PropTypes.string})),
  setQuery: PropTypes.func,
  clearQueryHistory: PropTypes.func
};

const History = connect(mapStateToProps, {setQuery, clearQueryHistory})(HistoryBody);

export default History;
