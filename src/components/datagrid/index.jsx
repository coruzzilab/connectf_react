/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import {Tabs} from 'antd';
import {Link} from 'react-router';
import PropTypes from 'prop-types';
import _ from 'lodash';
const {TabPane} = Tabs;

import 'handsontable/dist/handsontable.full.css';

import DF from './df';
import Meta from './meta';
import Extra from './extra';
import HeatMap from './heatmap';

class Datagrid extends React.Component {
  render() {
    let {location} = this.props;

    return <Tabs defaultActiveKey={_.get(location, 'query.tab') || "1"}>
      <TabPane tab="Query" key="1">
        <DF/>
      </TabPane>
      <TabPane tab="Meta" key="2">
        <Meta/>
      </TabPane>
      <TabPane tab="Cytoscape" key="3">
        <div>
          <ul className="list-group">
            <li className="list-group-item"><Link to="/cytoscape/query">Query TFs</Link></li>
            <li className="list-group-item"><Link to="/cytoscape/target">TargetDB TFs</Link></li>
            <li className="list-group-item"><Link to="/cytoscape/genome">Whole Genome TFs</Link></li>
          </ul>
        </div>
      </TabPane>
      <TabPane tab="Heatmap" key="4">
        <HeatMap/>
      </TabPane>
      <TabPane tab="Extras" key="5">
        <Extra/>
      </TabPane>
    </Tabs>;
  }
}

Datagrid.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object
};

export default Datagrid;
