/**
 * Created by zacharyjuang on 11/23/16.
 */
import React from 'react';
import {Tabs} from 'antd';
const {TabPane} = Tabs;

import 'handsontable/dist/handsontable.full.css';

import DF from './df';
import Meta from './meta';
import Cytoscape from './cytoscape';
import Extra from './extra';

export default class Datagrid extends React.Component {
  render() {
    return <Tabs defaultActiveKey="1">
      <TabPane tab="DF" key="1">
        <DF/>
      </TabPane>
      <TabPane tab="Meta" key="2">
        <Meta/>
      </TabPane>
      <TabPane tab="Cytoscape" key="3">
        <Cytoscape/>
      </TabPane>
      <TabPane tab="Extras" key="4">
        <Extra/>
      </TabPane>
    </Tabs>
  }
}
