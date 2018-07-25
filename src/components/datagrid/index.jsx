/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Link} from 'react-router-dom';

import {Tabs, Tab} from 'react-bootstrap';

import DF from './df';
import Meta from './meta';
import Extra from './extra';
import HeatMap from './heatmap';
import MotifEnrichment from './motif_enrichment';

class Datagrid extends React.Component {
  onTabClick(key) {
    this.props.history.push('/datagrid/' + key);
  }

  render() {
    let {key} = this.props.match.params;

    return <Tabs activeKey={key} onSelect={this.onTabClick.bind(this)} id="result">
      <Tab title="Table" eventKey="table">
        <DF/>
      </Tab>
      <Tab title="Meta" eventKey="meta">
        <Meta/>
      </Tab>
      <Tab title="Cytoscape" eventKey="cytoscape">
        <div>
          <Link to="/cytoscape" className="btn btn-default">Open Cytoscape</Link>
        </div>
      </Tab>
      <Tab title="Heatmap" eventKey="heatmap">
        <HeatMap/>
      </Tab>
      <Tab title="Motif Enrichment" eventKey="motif">
        <MotifEnrichment/>
      </Tab>
      <Tab title="Extras" eventKey="extra">
        <Extra/>
      </Tab>
    </Tabs>;
  }
}

Datagrid.propTypes = {
  match: PropTypes.object,
  history: PropTypes.object
};

export default Datagrid;
