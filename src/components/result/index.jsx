/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Redirect, Switch} from 'react-router-dom';
import {Nav, NavItem, TabContent} from 'reactstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {clearEdges, clearQuery, clearQueryTree, clearRequestId} from "../../actions";

import Summary from './summary';
import Table from './table';
import Meta from './meta';
import Download from './download';
import TargetEnrichment from './target_enrichment';
import MotifEnrichment from './motif_enrichment';
import AnalysisEnrichment from './analysis_enrichment';
import Network from './network';
import {NavLink, QueryPopover, RouteTabPane} from "./common";

function mapStateToProps({heatmap}) {
  return {
    heatmap
  };
}

class ResultBody extends React.Component {
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
    let {match, location: {pathname}} = this.props;

    return <div>
      <Nav tabs>
        <NavItem>
          <NavLink to={"/result/summary"}>
            Summary
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/result/table"}>
            Table
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/result/meta"}>
            Metadata
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/result/network"}>
            Network
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/result/target"}>
            Target Enrichment
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/result/motif"}>
            Motif Enrichment
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/result/analysis"}>
            Analysis Enrichment
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink to={"/result/download"}>
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
          <RouteTabPane path={match.path + '/summary'} tabId={pathname}>
            <Summary/>
          </RouteTabPane>
          <RouteTabPane path={match.path + '/table'} tabId={pathname}>
            <Table/>
          </RouteTabPane>
          <RouteTabPane path={match.path + '/meta'} tabId={pathname}>
            <Meta/>
          </RouteTabPane>
          <RouteTabPane path={match.path + '/network'} tabId={pathname}>
            <Network/>
          </RouteTabPane>
          <RouteTabPane path={match.path + '/target'} tabId={pathname}>
            <TargetEnrichment/>
          </RouteTabPane>
          <RouteTabPane path={match.path + '/motif'} tabId={pathname}>
            <MotifEnrichment/>
          </RouteTabPane>
          <RouteTabPane path={match.path + '/analysis'} tabId={pathname}>
            <AnalysisEnrichment/>
          </RouteTabPane>
          <RouteTabPane path={match.path + '/download'} tabId={pathname}>
            <Download/>
          </RouteTabPane>
          <Redirect to="/result/summary"/>
        </Switch>
      </TabContent>
      <QueryPopover target={() => this.query.current} placement="auto" isOpen={popoverOpen}
                    toggle={this.togglePopover.bind(this)}/>
    </div>;
  }
}

ResultBody.propTypes = {
  location: PropTypes.object,
  match: PropTypes.object,
  history: PropTypes.object,
  heatmap: PropTypes.object,
  clearQuery: PropTypes.func,
  clearQueryTree: PropTypes.func,
  clearEdges: PropTypes.func,
  clearRequestId: PropTypes.func
};

const Result = connect(mapStateToProps, {clearQuery, clearQueryTree, clearEdges, clearRequestId})(ResultBody);

export default Result;
