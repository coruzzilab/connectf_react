/**
 * @author zacharyjuang
 * 12/5/16
 */
import React from 'react';
import {Tabs} from 'antd';
const TabPane = Tabs.TabPane;

import {OPERANDS} from '../../actions';
import {GROUP_NODE, VALUE_NODE} from '../../reducers';

import _ from 'lodash';

class Value extends React.Component {
  componentWillMount() {
    let {node, valueOptions, updateKeyRaw} = this.props;
    updateKeyRaw(node.id, _.get(valueOptions, '0.0', ''))
  }

  handleFile() {
    let {node, updateValueRaw} = this.props;
    updateValueRaw(node.id, `[${this.refs.oper.value} {${_.get(this.refs.file, 'files.0.name', '')}}]`);
  }

  render() {
    let {addFile, node, updateValue, updateKey, removeNode, valueOptions} = this.props;
    let valueInput = <input type="text" id="input" className="form-control"
                            value={node.value}
                            onChange={updateValue.bind(this, node.id)}/>;
    return <div className="form-inline condition">
      <select className="form-control" style={{float: 'left'}} ref="keyName"
              onChange={updateKey.bind(undefined, node.id)} value={node.key}>
        {_.map(valueOptions, (o) => {
          return <option key={o[0]} value={o[0]}>{o[1]}</option>
        })}
      </select>
      <div style={{display: 'inline-block'}}>
        {addFile ?
          <Tabs defaultActiveKey="1" type="card">
            <TabPane tab="TF" key="1">
              {valueInput}
            </TabPane>
            <TabPane tab="File" key="2">
              <select className="form-control" ref="oper" onChange={this.handleFile.bind(this)}>
                <option value="And">And</option>
                <option value="Or">Or</option>
              </select>
              <input ref="file" type="file" className="form-control" onChange={this.handleFile.bind(this)}/>
            </TabPane>
          </Tabs> :
          valueInput
        }
      </div>
      <button className="btn btn-sm btn-danger" style={{verticalAlign: 'middle', float: 'right'}}
              onClick={removeNode.bind(undefined, node.id)}>
        <span className="glyphicon glyphicon-minus-sign"/>
      </button>
    </div>;
  }
}

Value.propTypes = {
  node: React.PropTypes.object.isRequired,
  updateValue: React.PropTypes.func.isRequired,
  updateValueRaw: React.PropTypes.func,
  updateKey: React.PropTypes.func,
  updateKeyRaw: React.PropTypes.func,
  removeNode: React.PropTypes.func.isRequired,
  addFile: React.PropTypes.bool,
  valueOptions: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired
};

class Node extends React.Component {
  render() {
    let {tree, node, addValue, addGroup, operChange, removeNode, removable} = this.props;
    return <div className="alert form-inline alert-warning alert-group group">
      <select className="form-control" value={node.oper}
              onChange={operChange.bind(undefined, node.id)}>
        {OPERANDS.map((o) => <option value={o} key={o}>{o}</option>)}
      </select>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addValue.bind(undefined, node.id)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Condition
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addGroup.bind(undefined, node.id)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Group
      </button>
      {removable ?
        <button style={{marginLeft: '5px'}} className="btn btn-sm btn-danger"
                onClick={removeNode.bind(undefined, node.id)}>
          <span className="glyphicon glyphicon-minus-sign"/> Remove Group
        </button> :
        null}
      {_(tree)
        .filter((n) => n.nodeType === VALUE_NODE)
        .intersectionWith(
          node.children,
          (s, o) => s.id === o)
        .map((n) => {
          return <Value {...this.props} key={n.id} node={n}/>
        })
        .value()}
      {_(tree)
        .filter((n) => n.nodeType === GROUP_NODE)
        .intersectionWith(
          node.children,
          (s, o) => s.id === o)
        .map((n) => {
          return <Node {...this.props} key={n.id} node={n} removable={true}/>
        })
        .value()}
    </div>;
  }
}

Node.propTypes = {
  removable: React.PropTypes.bool,
  addFile: React.PropTypes.bool,
  node: React.PropTypes.object.isRequired,
  operChange: React.PropTypes.func.isRequired,
  addValue: React.PropTypes.func.isRequired,
  updateValue: React.PropTypes.func.isRequired,
  updateValueRaw: React.PropTypes.func,
  updateKey: React.PropTypes.func,
  updateKeyRaw: React.PropTypes.func,
  addGroup: React.PropTypes.func.isRequired,
  removeNode: React.PropTypes.func.isRequired,
  tree: React.PropTypes.arrayOf(React.PropTypes.object),
  valueOptions: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string))
};

class TreeBody extends React.Component {
  render() {
    let {root} = this.props;
    return <div>
      {root.map((n) => {
        return <Node {...this.props} key={n.id} node={n}/>;
      })}
    </div>;
  }
}

TreeBody.propTypes = {
  root: React.PropTypes.arrayOf(React.PropTypes.object),
  tree: React.PropTypes.arrayOf(React.PropTypes.object),
  operChange: React.PropTypes.func,
  addValue: React.PropTypes.func,
  updateValue: React.PropTypes.func,
  updateValueRaw: React.PropTypes.func,
  updateKey: React.PropTypes.func,
  updateKeyRaw: React.PropTypes.func,
  addGroup: React.PropTypes.func,
  removeNode: React.PropTypes.func,
  addFile: React.PropTypes.bool,
  valueOptions: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired
};

export default TreeBody;
