/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import {Link} from 'react-router';
import PropTypes from 'prop-types';
import _ from 'lodash';

import {Tabs, Tab} from 'react-bootstrap';

import DF from './df';
import Meta from './meta';
import Extra from './extra';
import HeatMap from './heatmap';

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
      key: _.get(location, 'query.tab') || 1
    })
  }

  onTabClick(key) {
    this.setState({key});
  }

  render() {
    let {key} = this.state;

    return <Tabs activeKey={key} onSelect={this.onTabClick.bind(this)} id="result">
      <Tab title="Query" eventKey={1}>
        <DF/>
      </Tab>
      <Tab title="Meta" eventKey={2}>
        <Meta/>
      </Tab>
      <Tab title="Cytoscape" eventKey={3}>
        <div>
          <ul className="list-group">
            <li className="list-group-item"><Link to="/cytoscape/query">Query TFs</Link></li>
            <li className="list-group-item"><Link to="/cytoscape/target">TargetDB TFs</Link></li>
            <li className="list-group-item"><Link to="/cytoscape/genome">Whole Genome TFs</Link></li>
          </ul>
        </div>
      </Tab>
      <Tab title="Heatmap" eventKey={4}>
        <HeatMap/>
      </Tab>
      <Tab title="Extras" eventKey={5}>
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
