/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Nav, NavItem, Popover, PopoverBody, TabContent, TabPane} from 'reactstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {clearEdges, clearQuery, clearQueryTree, clearRequestId} from "../../actions";
import _ from 'lodash';
import Table from './table';
import Meta from './meta';
import Download from './download';
import TargetEnrichment from './target_enrichment';
import MotifEnrichment from './motif_enrichment';
import Cytoscape from './cytoscape';
import {NavLink} from "./common";


function mapStateToProps({heatmap}) {
  return {
    heatmap
  };
}

class QueryPopoverBody extends React.Component {
  render() {
    let {edges, query} = this.props;
    return <Popover className="mw-100" {..._.omit(this.props, ['query', 'dispatch', 'edges'])}>
      <PopoverBody>
        <h6>Query</h6>
        <div className="query-popover text-monospace mb-1 border rounded border-light bg-light">
          {query}
        </div>
        {edges.length ?
          <div>
            <h6>Additional Edges</h6>
            <ul>
              {_.map(edges, (e, i) => {
                return <li key={i}>{e}</li>;
              })}
            </ul>
          </div> :
          null}

      </PopoverBody>
    </Popover>;
  }
}

QueryPopoverBody.propTypes = {
  query: PropTypes.string,
  edges: PropTypes.arrayOf(PropTypes.string)
};

const QueryPopover = connect(({query, edges}) => ({query, edges}))(QueryPopoverBody);

class Datagrid extends React.Component {
  constructor(props) {
    super(props);
    this.query = React.createRef();

    this.state = {
      popoverOpen: false
    };
  }

  togglePopover() {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
  }

  back() {
    this.props.history.push('/query');
  }

  backReset() {
    this.props.clearQuery();
    this.props.clearQueryTree();
    this.props.clearEdges();
    this.props.clearRequestId();
    this.props.history.push('/query');
  }

  render() {
    let {popoverOpen} = this.state;
    let {match, location} = this.props;
    let {pathname} = location;

    return <div>
      <Nav tabs>
        <NavItem>
          <NavLink to={"/datagrid/table"}>
            Table
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/datagrid/meta"}>
            Metadata
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/datagrid/cytoscape"}>
            Cytoscape
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/datagrid/heatmap"}>
            Target Enrichment
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/datagrid/motif"}>
            Motif Enrichment
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/datagrid/download"}>
            Download
          </NavLink>
        </NavItem>
        <NavItem className="ml-auto">
          <div className="btn-toolbar">
            <div className="btn-group mr-2">
              <a className="btn btn-outline-dark" ref={this.query} onClick={this.togglePopover.bind(this)}>
                <FontAwesomeIcon icon="info-circle" className="mr-1"/>Show Query
              </a>
            </div>
            <div className="btn-group mr-1">
              <button type="button" className="btn btn-primary" onClick={this.back.bind(this)}>
                <FontAwesomeIcon icon="arrow-circle-left" className="mr-1"/>Back
              </button>
              <button type="button" className="btn btn-outline-danger" onClick={this.backReset.bind(this)}>
                <FontAwesomeIcon icon="sync" className="mr-1"/>New Query
              </button>
            </div>
          </div>

        </NavItem>
      </Nav>

      <TabContent activeTab={pathname}>
        <Switch>
          <Route path={match.path + '/table'} render={() => {
            return <TabPane tabId={pathname}>
              <Table/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/meta'} render={() => {
            return <TabPane tabId={pathname}>
              <Meta/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/cytoscape'} render={() => {
            return <TabPane tabId={pathname}>
              <Cytoscape/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/heatmap'} render={() => {
            return <TabPane tabId={pathname}>
              <TargetEnrichment/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/motif'} render={() => {
            return <TabPane tabId={pathname}>
              <MotifEnrichment/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/download'} render={() => {
            return <TabPane tabId={pathname}>
              <Download/>
            </TabPane>;
          }}/>
          <Redirect to="/datagrid/table"/>
        </Switch>
      </TabContent>
      <QueryPopover target={() => this.query.current} placement="auto" isOpen={popoverOpen}
                    toggle={this.togglePopover.bind(this)}/>
    </div>;
  }
}

Datagrid.propTypes = {
  location: PropTypes.object,
  match: PropTypes.object,
  history: PropTypes.object,
  heatmap: PropTypes.object,
  clearQuery: PropTypes.func,
  clearQueryTree: PropTypes.func,
  clearEdges: PropTypes.func,
  clearRequestId: PropTypes.func
};

export default connect(mapStateToProps, {clearQuery, clearQueryTree, clearEdges, clearRequestId})(Datagrid);
