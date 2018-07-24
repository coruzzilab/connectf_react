/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import {Link} from 'react-router';

import {Tabs, Tab} from 'react-bootstrap';

import DF from './df';
import Meta from './meta';
import Extra from './extra';
import HeatMap from './heatmap';
import MotifEnrichment from './motif_enrichment';

class Datagrid extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      key: 1
    }
  }

  componentDidMount() {
    let {location} = this.props;

    this.setState({
      key: parseInt(_.get(location, 'query.tab', 1))
    })
  }

  onTabClick(key) {
    this.setState({key});
  }

  render() {
    let {key} = this.state;

    return <Tabs activeKey={key} onSelect={this.onTabClick.bind(this)} id="result">
      <Tab title="Table" eventKey={1}>
        <DF/>
      </Tab>
      <Tab title="Meta" eventKey={2}>
        <Meta/>
      </Tab>
      <Tab title="Cytoscape" eventKey={3}>
        <div>
          <Link to="/cytoscape" className="btn btn-default">Open Cytoscape</Link>
        </div>
      </Tab>
      <Tab title="Heatmap" eventKey={4}>
        <HeatMap/>
      </Tab>
      <Tab title="Motif Enrichment" eventKey={5}>
        <MotifEnrichment/>
      </Tab>
      <Tab title="Extras" eventKey={6}>
        <Extra/>
      </Tab>
    </Tabs>;
  }
}

Datagrid.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object
};

export default Datagrid;
