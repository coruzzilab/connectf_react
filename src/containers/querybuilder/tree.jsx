/**
 * @author zacharyjuang
 * 12/5/16
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Tabs, AutoComplete} from 'antd';
const TabPane = Tabs.TabPane;

import {OPERANDS} from '../../actions';
import {GROUP_NODE, VALUE_NODE} from '../../reducers';

import _ from 'lodash';
import $ from 'jquery';

function caseInsensitiveCompare(input, option) {
  // a cumbersome way to search case insensitively
  return option.key.toLowerCase().indexOf(input.toLowerCase()) >= 0;
}

function idCompare(s, o) {
  return s.id === o;
}

function filterNodeType(nodeType = VALUE_NODE) {
  return function (n) {
    return n.nodeType === nodeType;
  }
}

class Value extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      dataSource: []
    };

  }

  componentDidMount() {
    this.getAutoCompleteList();
  }

  componentDidUpdate(prevProps) {
    let {node} = this.props;
    if (node.key !== prevProps.node.key) {
      this.getAutoCompleteList();
    }
  }

  getAutoCompleteList() {
    let {autoCompleteUrl, autoCompleteKey, node} = this.props;
    if (_.isString(autoCompleteUrl) || _.isFunction(autoCompleteUrl)) {
      let url;
      if (_.isFunction(autoCompleteUrl)) {
        url = autoCompleteUrl(node);
      } else {
        url = autoCompleteUrl;
      }
      $.ajax({
        url,
        contentType: false,
        data: {
          format: 'json',
          uinput: ''
        }
      }).done((data) => {
        this.setState({
          dataSource: _.map(data, autoCompleteKey)
        });
      });
    }
  }

  handleFile() {
    let {node, updateValueRaw} = this.props;
    let {oper, file} = this;
    updateValueRaw(node.id, {
      oper: oper.value,
      file: _.get(file, 'files.0')
    });
  }

  handleChange(value) {
    let {node, updateValueRaw} = this.props;
    updateValueRaw(node.id, value);
  }

  render() {
    let {addFile, node, updateKey, removeNode, valueOptions} = this.props;
    let {dataSource} = this.state;
    let valueInput = <AutoComplete value={node.value}
                                   onChange={this.handleChange.bind(this)}
                                   style={{width: '30em', height: '34px'}} // @todo: better CSS styling
                                   size="large"
                                   dataSource={dataSource}
                                   filterOption={caseInsensitiveCompare}/>;
    return <div className="form-inline condition">
      <select className="form-control" style={{float: 'left'}} ref={(c) => {this.keyName = c}}
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
              <select className="form-control" ref={(c) => {this.oper = c}} onChange={this.handleFile.bind(this)}>
                <option value="And">And</option>
                <option value="Or">Or</option>
              </select>
              <input ref={(c) => {this.file = c}} type="file" className="form-control" onChange={this.handleFile.bind(this)}/>
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
  addFile: PropTypes.bool,
  autoCompleteKey: PropTypes.string,
  autoCompleteUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  node: PropTypes.object.isRequired,
  removeNode: PropTypes.func.isRequired,
  updateValue: PropTypes.func.isRequired,
  updateValueRaw: PropTypes.func,
  updateKey: PropTypes.func,
  updateKeyRaw: PropTypes.func,
  valueOptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired
};

Value.defaultProps = {
  autoCompleteKey: 'text'
};

class Node extends React.Component {
  render() {
    let {tree, node, addValue, addGroup, operChange, removeNode, removable, valueOptions} = this.props;
    let _tree = _(tree);

    return <div className="alert form-inline alert-warning alert-group group">
      <select className="form-control" value={node.oper}
              onChange={operChange.bind(undefined, node.id)}>
        {OPERANDS.map((o) => <option value={o} key={o}>{o}</option>)}
      </select>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addValue.bind(undefined, node.id, _.get(valueOptions, '0.0', ''))}>
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
      {_tree
        .filter(filterNodeType(VALUE_NODE))
        .intersectionWith(
          node.children,
          idCompare)
        .map((n) => {
          return <Value {...this.props} key={n.id} node={n}/>
        })
        .value()}
      {_tree
        .filter(filterNodeType(GROUP_NODE))
        .intersectionWith(
          node.children,
          idCompare)
        .map((n) => {
          return <Node {...this.props} key={n.id} node={n} removable={true}/>
        })
        .value()}
    </div>;
  }
}

Node.propTypes = {
  autoCompleteUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  removable: PropTypes.bool,
  addFile: PropTypes.bool,
  node: PropTypes.object.isRequired,
  operChange: PropTypes.func.isRequired,
  addValue: PropTypes.func.isRequired,
  updateValue: PropTypes.func.isRequired,
  updateValueRaw: PropTypes.func,
  updateKey: PropTypes.func,
  updateKeyRaw: PropTypes.func,
  addGroup: PropTypes.func.isRequired,
  removeNode: PropTypes.func.isRequired,
  tree: PropTypes.arrayOf(PropTypes.object),
  valueOptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string))
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
  autoCompleteKey: PropTypes.string,
  autoCompleteUrl: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  root: PropTypes.arrayOf(PropTypes.object),
  tree: PropTypes.arrayOf(PropTypes.object),
  operChange: PropTypes.func,
  addValue: PropTypes.func,
  updateValue: PropTypes.func,
  updateValueRaw: PropTypes.func,
  updateKey: PropTypes.func,
  updateKeyRaw: PropTypes.func,
  addGroup: PropTypes.func,
  removeNode: PropTypes.func,
  addFile: PropTypes.bool,
  valueOptions: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.string)).isRequired
};

export default TreeBody;
