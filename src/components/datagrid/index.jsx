/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Link, Route, Redirect, Switch} from 'react-router-dom';

import {TabContent, TabPane, Nav, NavItem, NavLink} from 'reactstrap';

import DF from './df';
import Meta from './meta';
import Extra from './extra';
import HeatMap from './heatmap';
import MotifEnrichment from './motif_enrichment';

class Datagrid extends React.Component {
  onTabClick(key) {
    this.props.history.push(key);
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
      </Nav>
      <TabContent activeTab={pathname}>
        <Switch>
          <Route path={match.path + '/table'} component={() => {
            return <TabPane tabId="/datagrid/table">
              <DF/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/meta'} component={() => {
            return <TabPane tabId="/datagrid/meta">
              <Meta/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/cytoscape'} component={() => {
            return <TabPane tabId="/datagrid/cytoscape">
              <Link to="/cytoscape" className="btn btn-light">Open Cytoscape</Link>
            </TabPane>;
          }}/>
          <Route path={match.path + '/heatmap'} component={() => {
            return <TabPane tabId="/datagrid/heatmap">
              <HeatMap/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/motif'} component={() => {
            return <TabPane tabId="/datagrid/motif">
              <MotifEnrichment/>
            </TabPane>;
          }}/>
          <Route path={match.path + '/extra'} component={() => {
            return <TabPane tabId="/datagrid/extra">
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
  history: PropTypes.object
};

export default Datagrid;
