/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Route, Redirect, Switch} from 'react-router-dom';
import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {clearQuery, clearQueryTree, clearEdges} from "../../actions";

import DF from './df';
import Meta from './meta';
import Extra from './extra';
import HeatMap from './heatmap';
import MotifEnrichment from './motif_enrichment';
import Cytoscape from './cytoscape';

function mapStateToProps({heatmap}) {
  return {
    heatmap
  };
}

class Datagrid extends React.Component {
  onTabClick(key) {
    this.props.history.push(key);
  }

  back() {
    this.props.history.push('/query');
  }

  backReset() {
    this.props.clearQuery();
    this.props.clearQueryTree();
    this.props.clearEdges();
    this.props.history.push('/query');
  }
  render() {
    let {match, location} = this.props;
    let {pathname} = location;

    return <div>
      <Nav tabs>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "/datagrid/table")}
                   active={pathname === "/datagrid/table"}>
            Table
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "/datagrid/meta")}
                   active={pathname === "/datagrid/meta"}>
            Metadata
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "/datagrid/cytoscape")}
                   active={pathname === "/datagrid/cytoscape"}>
            Cytoscape
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "/datagrid/heatmap")}
                   active={pathname === "/datagrid/heatmap"}>
            Heatmap
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "/datagrid/motif")}
                   active={pathname === "/datagrid/motif"}>
            Motif Enrichment
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink onClick={this.onTabClick.bind(this, "/datagrid/extra")}
                   active={pathname === "/datagrid/extra"}>
            Extra
          </NavLink>
        </NavItem>
        <NavItem className="ml-auto">
          <div className="btn-group mr-1">
            <button type="button" className="btn btn-primary" onClick={this.back.bind(this)}>
              <FontAwesomeIcon icon="arrow-circle-left" className="mr-1"/>Back</button>
            <button type="button" className="btn btn-outline-danger" onClick={this.backReset.bind(this)}>
              <FontAwesomeIcon icon="sync" className="mr-1"/>New Query</button>
          </div>
        </NavItem>
      </Nav>

      <TabContent activeTab={pathname}>
        <Switch>
          <Route path={match.path + '/table'} render={() => {
            return <TabPane tabId={pathname}>
              <DF/>
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
              <HeatMap/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/motif'} render={() => {
            return <TabPane tabId={pathname}>
              <MotifEnrichment/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/extra'} render={() => {
            return <TabPane tabId={pathname}>
              <Extra/>
            </TabPane>;
          }}/>
          <Redirect to="/datagrid/table"/>
        </Switch>
      </TabContent>
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
  clearEdges: PropTypes.func
};

export default connect(mapStateToProps, {clearQuery, clearQueryTree, clearEdges})(Datagrid);
