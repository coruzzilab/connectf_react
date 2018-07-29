/**
 * Created by zacharyjuang on 11/24/16.
 */
import React from "react";
import {connect} from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";
import $ from 'jquery';
import uuidv4 from 'uuid/v4';
import Clipboard from 'clipboard';
import classNames from 'classnames';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  BASE_URL,
  postQuery,
  clearQuery,
  setQuery,
  addTF,
  addGroup,
  setQueryName,
  removeNode,
  setQueryOper,
  setQueryNot,
  addMod,
  addModGroup,
  setModKey,
  setModValue,
  setModInnerOper,
  clearQueryTree,
  moveItem,
  setParent
} from '../../actions';
import {getQuery, getParentTfTree} from "../../utils";

const QueryContext = React.createContext();

const mapStateToProps = ({busy, query, queryTree}) => {
  return {
    busy,
    query,
    queryTree
  };
};

class ImmobileInput extends React.Component {
  render() {
    return <QueryContext.Consumer>{value => {
      return <input onFocus={value.setDraggable.bind(undefined, false)}
                    onBlur={value.setDraggable.bind(undefined, true)}
                    autoFocus
                    {...this.props}/>;
    }}</QueryContext.Consumer>;
  }
}

class TargetGenesFile extends React.Component {
  constructor(props) {
    super(props);
    this.targetGenes = React.createRef();
  }

  componentDidMount() {
    this.targetGenes.current.scrollIntoView();
  }

  handleChange(e) {
    this.props.handleChange(e.target.files);
  }

  render() {
    return <input type="file" className="form-control-file"
                  onChange={this.handleChange.bind(this)}
                  ref={this.targetGenes}/>;
  }
}

TargetGenesFile.propTypes = {
  handleChange: PropTypes.func
};


class AndOrSelect extends React.Component {
  handleChange(e) {
    this.props.handleChange(e.target.value);
  }

  render() {
    let {value, className, disable} = this.props;
    return <select className={classNames("form-control col-1", className)} value={value}
                   onChange={this.handleChange.bind(this)}
                   disabled={disable}>
      <option>or</option>
      <option>and</option>
    </select>;
  }
}

AndOrSelect.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  className: PropTypes.string,
  disable: PropTypes.bool
};


class NotSelect extends React.Component {
  handleChange(e) {
    this.props.handleChange(e.target.value === 'not');
  }

  render() {
    let {value, className} = this.props;

    return <select className={classNames("form-control col-1", className)}
                   onChange={this.handleChange.bind(this)}
                   value={value ? 'not' : '-'}>
      <option>-</option>
      <option>not</option>
    </select>;
  }
}

NotSelect.propTypes = {
  value: PropTypes.bool.isRequired,
  handleChange: PropTypes.func.isRequired,
  className: PropTypes.string
};


class ModBody extends React.Component {
  constructor(props) {
    super(props);
    this.dropTarget = React.createRef();
    this.state = {
      dataSource: [],
      dataSourceValues: []
    };
    this.uuid = uuidv4();

    this._getAutoComplete = _.debounce(this.getAutoComplete.bind(this), 200);
    this._getKeyAutoComplete = _.debounce(this.getKeyAutoComplete.bind(this), 200);
  }

  componentDidMount() {
    this._getAutoComplete();
    this._getKeyAutoComplete();
  }

  componentDidUpdate(prevProps) {
    let {node, setModInnerOper, queryTree, setModValue} = this.props;
    if (node.key !== prevProps.node.key) {
      this._getKeyAutoComplete();
    }

    if (!_.isEqual(getParentTfTree(queryTree, node), getParentTfTree(prevProps.queryTree, prevProps.node))) {
      this._getAutoComplete();
      this._getKeyAutoComplete();
    }

    if (node.key !== prevProps.node.key) {
      setModValue(node.id, '');
    }

    if (node.key !== 'pvalue' && node.key !== 'fc' && node.innerOper !== '=') {
      setModInnerOper(node.id, '=');
    }
  }

  getAutoComplete() {
    let {node, queryTree} = this.props;

    let parent = getParentTfTree(queryTree, node);
    let tfs = _(parent).filter((o) => o.nodeType === 'TF').map('name').value();

    let data = {};

    if (_.size(tfs)) {
      data.tf = tfs;
    }

    $.ajax({
      url: `${BASE_URL}/api/key/`,
      contentType: false,
      data
    }).done((dataSource) => {
      this.setState({dataSource});
      if (!node.key) {
        this.props.setModKey(node.id, _.head(dataSource));
      }
    });
  }

  getKeyAutoComplete() {
    let {queryTree, node} = this.props;

    let parent = getParentTfTree(queryTree, node);
    let tfs = _(parent).filter((o) => o.nodeType === 'TF').map('name').value();

    let data = {};

    if (_.size(tfs)) {
      data.tf = tfs;
    }

    $.ajax({
      url: `${BASE_URL}/api/key/${this.props.node.key}/`,
      contentType: false,
      data
    }).done((dataSourceValues) => {
      this.setState({dataSourceValues});
    });
  }

  setModKey(e) {
    this.props.setModKey(this.props.node.id, e.target.value);
  }

  setModValue(e) {
    this.props.setModValue(this.props.node.id, e.target.value);
  }

  setModInnerOper(e) {
    this.props.setModInnerOper(this.props.node.id, e.target.value);
  }

  render() {
    let {
      first, node, addMod, addModGroup, removeNode, setQueryNot, setQueryOper, queryTree, moveItem, setParent
    } = this.props;
    let {dataSource, dataSourceValues} = this.state;

    return <QueryContext.Consumer>{value => {
      return <div draggable={value.draggable} className="row border border-dark rounded m-2" ref={this.dropTarget}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData('id', node.id);

                    let rect = this.dropTarget.current.getBoundingClientRect();
                    value.setClientYOffset(e.clientY - rect.top - rect.height / 2);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    let source_id = e.dataTransfer.getData('id');
                    if (source_id !== node.id) {
                      let source = _.find(queryTree, ['id', source_id]);
                      if (source.nodeType === 'MOD' || source.nodeType === 'MOD_GROUP') {
                        let rect = this.dropTarget.current.getBoundingClientRect();
                        let after = e.clientY - value.clientYOffset - rect.top - rect.height / 2 >= 0;
                        moveItem(source_id, node.id, after);
                        if (source.parent !== node.parent) {
                          setParent(source_id, node.parent);
                        }
                      }
                    }

                  }}>
        <div className="col">
          <div className="row m-2">
            <div className="col">
              <div className="form-row">
                <AndOrSelect className="mr-1" value={node.oper} handleChange={setQueryOper.bind(undefined, node.id)}
                             disable={first}/>
                <NotSelect className="mr-1" value={node.not_} handleChange={setQueryNot.bind(undefined, node.id)}/>
                <select className="form-control col mr-1" onChange={this.setModKey.bind(this)} value={node.key}>
                  {_.map(dataSource, (o, i) => {
                    return <option key={i}>{o}</option>;
                  })}
                </select>
                {node.key === 'pvalue' || node.key === 'fc' ?
                  <select className="form-control col-1 mr-1" value={node.innerOper}
                          onChange={this.setModInnerOper.bind(this)}>
                    <option>=</option>
                    <option>&lt;</option>
                    <option>&gt;</option>
                    <option>&lt;=</option>
                    <option>&gt;=</option>
                  </select> :
                  null}
                <ImmobileInput className="form-control col-6"
                               type="text"
                               list={this.uuid}
                               onChange={this.setModValue.bind(this)}
                               value={node.value}/>
              </div>
              <datalist id={this.uuid}>
                {_.map(dataSourceValues, (o, i) => {
                  return <option key={i}>{o}</option>;
                })}
              </datalist>
            </div>
            <div className="col">
              <div className="btn-toolbar">
                <div className="btn-group mr-2">
                  <button type="button" className="btn btn-success"
                          onClick={addMod.bind(undefined, '', '', node.parent, node.id, undefined, undefined, undefined)}>
                    <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Modifier
                  </button>
                  <button type="button" className="btn btn-success"
                          onClick={addModGroup.bind(undefined, node.parent, node.id, undefined, undefined)}>
                    <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Modifier Group
                  </button>
                </div>
                <div className="btn-group">
                  <button type="button" className="btn btn-danger"
                          onClick={removeNode.bind(undefined, node.id)}>
                    <FontAwesomeIcon icon="minus-circle"/>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>;
    }}</QueryContext.Consumer>;
  }
}

ModBody.propTypes = {
  node: PropTypes.object,
  first: PropTypes.bool,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  removeNode: PropTypes.func,
  setQueryOper: PropTypes.func,
  setQueryNot: PropTypes.func,
  addMod: PropTypes.func,
  addModGroup: PropTypes.func,
  setModKey: PropTypes.func,
  setModValue: PropTypes.func,
  setModInnerOper: PropTypes.func,
  moveItem: PropTypes.func,
  setParent: PropTypes.func
};

const Mod = connect(mapStateToProps, {
  removeNode,
  setQueryOper,
  setQueryNot,
  addMod,
  addModGroup,
  setModKey,
  setModValue,
  setModInnerOper,
  moveItem,
  setParent
})(ModBody);

class ModGroupBody extends React.Component {
  constructor(props) {
    super(props);
    this.dropTarget = React.createRef();
    this.queryDiv = React.createRef();
  }

  render() {
    let {
      first, node, queryTree, removeNode, addMod, addModGroup, setQueryNot, setQueryOper, moveItem, setParent
    } = this.props;


    let subTree = _(queryTree).filter((o) => o.parent === node.id);

    return <QueryContext.Consumer>{value => {
      return <div draggable={value.draggable} className="row border border-dark rounded m-2" ref={this.dropTarget}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData('id', node.id);

                    let rect = this.dropTarget.current.getBoundingClientRect();
                    value.setClientYOffset(e.clientY - rect.top - rect.height / 2);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    let source_id = e.dataTransfer.getData('id');
                    if (source_id !== node.id) {
                      let source = _.find(queryTree, ['id', source_id]);
                      if (source.nodeType === 'MOD' || source.nodeType === 'MOD_GROUP') {
                        let target;
                        let after;
                        let currY = e.clientY - value.clientYOffset;
                        let _currNodesPos = _(this.queryDiv.current.children)
                          .invokeMap('getBoundingClientRect')
                          .map(_.unary(_.partial(_.pick, _, ['top', 'height'])))
                          .map((rect) => rect.top + rect.height / 2);
                        let _currNodes = _(queryTree)
                          .filter((o) => o.nodeType === 'MOD' || o.nodeType === 'MOD_GROUP')
                          .filter((o) => o.parent === node.id);


                        let prevPos = _currNodesPos.findLastIndex((p) => p < currY);
                        let nextPos = _currNodesPos.findIndex((p) => p > currY);

                        if (prevPos === -1) {
                          target = _currNodes.head();
                          after = false;
                        } else if (nextPos === -1) {
                          target = _currNodes.last();
                          after = true;
                        } else {
                          let currNodes = _currNodes.value();
                          target = currNodes[prevPos];
                          after = true;
                        }
                        if (target) {
                          moveItem(source_id, target.id, after);
                        }
                        setParent(source_id, node.id);
                      }
                    }
                  }}>
        <div className="col">
          <div className="row m-2">
            <AndOrSelect className="mr-1" value={node.oper} handleChange={setQueryOper.bind(undefined, node.id)}
                         disable={first}/>
            <NotSelect className="mr-1" value={node.not_} handleChange={setQueryNot.bind(undefined, node.id)}/>
            <div className="btn-toolbar">
              <div className="btn-group mr-2">
                <button type="button" className="btn btn-success"
                        onClick={addMod.bind(undefined, '', '', node.id, node.id, undefined, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Modifier
                </button>
                <button type="button" className="btn btn-success"
                        onClick={addModGroup.bind(undefined, node.id, node.id, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Modifier Group
                </button>
              </div>
              <div className="btn-group mr-2">
                <button type="button" className="btn btn-danger"
                        onClick={removeNode.bind(undefined, node.id)}>
                  <FontAwesomeIcon icon="minus-circle" className="mr-1"/>Remove Modifier Group
                </button>
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-success"
                        onClick={addModGroup.bind(undefined, node.parent, node.id, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add TF Proceeding Modifier Group
                </button>
                <button type="button" className="btn btn-success"
                        onClick={addMod.bind(undefined, '', '', node.parent, node.id, undefined, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Proceeding Modifier
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col" ref={this.queryDiv}>
              {subTree.filter((o) => o.nodeType === 'MOD' || o.nodeType === 'MOD_GROUP').map((o, i, a) => {
                let first = _(a).slice(0, i).filter((n) => n.parent === o.parent).size() === 0;
                if (o.nodeType === 'MOD') {
                  return <Mod key={o.id}
                              first={first}
                              node={o}/>;
                } else if (o.nodeType === 'MOD_GROUP') {
                  return <ModGroup key={o.id}
                                   first={first}
                                   node={o}/>;
                }
              }).value()}
            </div>
          </div>
        </div>
      </div>;
    }}</QueryContext.Consumer>;
  }
}

ModGroupBody.propTypes = {
  node: PropTypes.object,
  first: PropTypes.bool,
  addMod: PropTypes.func,
  addModGroup: PropTypes.func,
  setQueryName: PropTypes.func,
  removeNode: PropTypes.func,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  setQueryOper: PropTypes.func,
  setQueryNot: PropTypes.func,
  moveItem: PropTypes.func,
  setParent: PropTypes.func
};

const ModGroup = connect(mapStateToProps, {
  addMod,
  addModGroup,
  setQueryName,
  removeNode,
  setQueryOper,
  setQueryNot,
  moveItem,
  setParent
})(ModGroupBody);

class ValueBody extends React.Component {
  constructor(props) {
    super(props);
    this.dropTarget = React.createRef();
    this.queryDiv = React.createRef();
    this.uuid = uuidv4();
    this.state = {
      dataSource: []
    };
  }

  componentDidMount() {
    this.getAutoComplete();
  }

  getAutoComplete() {
    $.ajax({
      url: `${BASE_URL}/api/tfs/`,
      contentType: false
    }).done((dataSource) => {
      this.setState({dataSource});
    });
  }

  handleQueryName(id, e) {
    this.props.setQueryName(id, e.target.value);
  }

  render() {
    let {
      first, node, addTF, addGroup, removeNode, setQueryNot, setQueryOper, addMod, addModGroup, queryTree, moveItem,
      setParent
    } = this.props;
    let {dataSource} = this.state;
    let subTree = _(queryTree).filter((o) => o.parent === node.id);
    let mods = subTree.filter((o) => o.nodeType === 'MOD' || o.nodeType === 'MOD_GROUP');

    return <QueryContext.Consumer>{value => {
      return <div draggable={value.draggable} className="row border border-dark rounded m-2" ref={this.dropTarget}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData('id', node.id);

                    let rect = this.dropTarget.current.getBoundingClientRect();
                    value.setClientYOffset(e.clientY - rect.top - rect.height / 2);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    let source_id = e.dataTransfer.getData('id');
                    if (source_id !== node.id) {
                      let source = _.find(queryTree, ['id', source_id]);
                      let rect = this.dropTarget.current.getBoundingClientRect();
                      let after = e.clientY - value.clientYOffset - rect.top - rect.height / 2 >= 0;
                      if (source.nodeType === 'TF' || source.nodeType === 'GROUP') {
                        moveItem(source_id, node.id, after);
                        if (source.parent !== node.parent) {
                          setParent(source_id, node.parent);
                        }
                      } else if (source.nodeType === 'MOD' || source.nodeType === 'MOD_GROUP') {
                        let target;
                        let after;
                        let currY = e.clientY - value.clientYOffset;
                        let _currNodesPos = _(this.queryDiv.current.children)
                          .invokeMap('getBoundingClientRect')
                          .map(_.unary(_.partial(_.pick, _, ['top', 'height'])))
                          .map((rect) => rect.top + rect.height / 2);
                        let _currNodes = _(queryTree)
                          .filter((o) => o.nodeType === 'MOD' || o.nodeType === 'MOD_GROUP')
                          .filter((o) => o.parent === node.id);


                        let prevPos = _currNodesPos.findLastIndex((p) => p < currY);
                        let nextPos = _currNodesPos.findIndex((p) => p > currY);

                        if (prevPos === -1) {
                          target = _currNodes.head();
                          after = false;
                        } else if (nextPos === -1) {
                          target = _currNodes.last();
                          after = true;
                        } else {
                          let currNodes = _currNodes.value();
                          target = currNodes[prevPos];
                          after = true;
                        }
                        if (target) {
                          moveItem(source_id, target.id, after);
                        }
                        setParent(source_id, node.id);
                      }
                    }

                  }}>
        <div className="col">
          <div className="row m-2">
            <div className="col">
              <div className="form-row">
                <AndOrSelect className="mr-1" value={node.oper} handleChange={setQueryOper.bind(undefined, node.id)}
                             disable={first}/>
                <NotSelect className="mr-1" value={node.not_} handleChange={setQueryNot.bind(undefined, node.id)}/>
                <ImmobileInput className="form-control col"
                               type="text"
                               list={this.uuid}
                               onChange={this.handleQueryName.bind(this, node.id)}
                               value={node.name}/>
              </div>
            </div>
            <datalist id={this.uuid}>
              {_.map(dataSource, (o, i) => {
                return <option value={o.value} key={i}>{o.name}</option>;
              })}
            </datalist>
            <div className="btn-toolbar col">
              <div className="btn-group mr-2">
                <button type="button" className="btn btn-success"
                        onClick={addTF.bind(undefined, '', node.parent, node.id, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add TF
                </button>
                <button type="button" className="btn btn-success"
                        onClick={addGroup.bind(undefined, node.parent, node.id, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add TF Group
                </button>
                <button type="button" className="btn btn-success"
                        onClick={addMod.bind(undefined, '', '', node.id, undefined, undefined, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Modifier
                </button>
                <button type="button" className="btn btn-success"
                        onClick={addModGroup.bind(undefined, node.id, undefined, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Modifier Group
                </button>
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-danger"
                        onClick={removeNode.bind(undefined, node.id)}>
                  <FontAwesomeIcon icon="minus-circle"/>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="w-100"/>
        <div className="col" ref={this.queryDiv}>
          {mods.map((o, i, a) => {
            let first = _(a).slice(0, i).filter((n) => n.parent === o.parent).size() === 0;
            if (o.nodeType === 'MOD') {
              return <Mod key={o.id} first={first} node={o}/>;
            } else if (o.nodeType === 'MOD_GROUP') {
              return <ModGroup key={o.id} first={first} node={o}/>;
            }
          }).value()}
        </div>
      </div>;
    }}</QueryContext.Consumer>;
  }
}

ValueBody.propTypes = {
  node: PropTypes.object,
  first: PropTypes.bool,
  addTF: PropTypes.func,
  addGroup: PropTypes.func,
  setQueryName: PropTypes.func,
  removeNode: PropTypes.func,
  setQueryOper: PropTypes.func,
  setQueryNot: PropTypes.func,
  addMod: PropTypes.func,
  addModGroup: PropTypes.func,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  moveItem: PropTypes.func,
  setParent: PropTypes.func
};

const Value = connect(mapStateToProps, {
  addTF,
  addGroup,
  setQueryName,
  removeNode,
  setQueryOper,
  setQueryNot,
  addMod,
  addModGroup,
  moveItem,
  setParent
})(ValueBody);

class GroupBody extends React.Component {
  constructor(props) {
    super(props);
    this.dropTarget = React.createRef();
    this.queryDiv = React.createRef();
  }

  render() {
    let {
      first, node, queryTree, removeNode, addTF, addGroup, addMod, addModGroup, setQueryNot, setQueryOper, moveItem,
      setParent
    } = this.props;
    let subTree = _(queryTree).filter((o) => o.parent === node.id);
    let mods = subTree.filter((o) => o.nodeType === 'MOD' || o.nodeType === 'MOD_GROUP');

    return <QueryContext.Consumer>{value => {
      return <div draggable={value.draggable} className="row border border-dark rounded m-2" ref={this.dropTarget}
                  onDragStart={(e) => {
                    e.stopPropagation();
                    e.dataTransfer.setData('id', node.id);

                    let rect = this.dropTarget.current.getBoundingClientRect();
                    value.setClientYOffset(e.clientY - rect.top - rect.height / 2);
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    let source_id = e.dataTransfer.getData('id');
                    if (source_id !== node.id) {
                      let target;
                      let after;
                      let currY = e.clientY - value.clientYOffset;
                      let _currNodesPos = _(this.queryDiv.current.children)
                        .invokeMap('getBoundingClientRect')
                        .map(_.unary(_.partial(_.pick, _, ['top', 'height'])))
                        .map((rect) => rect.top + rect.height / 2);
                      let _currNodes = _(queryTree).filter((o) => o.parent === node.id);


                      let prevPos = _currNodesPos.findLastIndex((p) => p < currY);
                      let nextPos = _currNodesPos.findIndex((p) => p > currY);

                      if (prevPos === -1) {
                        target = _currNodes.head();
                        after = false;
                      } else if (nextPos === -1) {
                        target = _currNodes.last();
                        after = true;
                      } else {
                        let currNodes = _currNodes.value();
                        target = currNodes[prevPos];
                        after = true;
                      }
                      if (target) {
                        moveItem(source_id, target.id, after);
                      }
                      setParent(source_id, node.id);
                    }
                  }}>
        <div className="col">
          <div className="row m-2">
            <AndOrSelect className="mr-1" value={node.oper} handleChange={setQueryOper.bind(undefined, node.id)}
                         disable={first}/>
            <NotSelect className="mr-1" value={node.not_} handleChange={setQueryNot.bind(undefined, node.id)}/>
            <div className="btn-toolbar col">
              <div className="btn-group mr-2">
                <button type="button" className="btn btn-success"
                        onClick={addTF.bind(undefined, '', node.id, undefined, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add TF
                </button>
                <button type="button" className="btn btn-success"
                        onClick={addGroup.bind(undefined, node.id, undefined, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add TF Group
                </button>
                <button type="button" className="btn btn-success"
                        onClick={addMod.bind(undefined, '', '', node.id, node.id, undefined, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Modifier
                </button>
                <button type="button" className="btn btn-success"
                        onClick={addModGroup.bind(undefined, node.id, node.id, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Modifier Group
                </button>
              </div>
              <div className="btn-group mr-2">
                <button type="button" className="btn btn-danger"
                        onClick={removeNode.bind(undefined, node.id)}>
                  <FontAwesomeIcon icon="minus-circle" className="mr-1"/>Remove TF Group
                </button>
              </div>
              <div className="btn-group">
                <button type="button" className="btn btn-success"
                        onClick={addGroup.bind(undefined, node.parent, node.id, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add TF Proceeding Group
                </button>
                <button type="button" className="btn btn-success"
                        onClick={addTF.bind(undefined, '', node.parent, node.id, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Proceeding TF
                </button>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col" ref={this.queryDiv}>
              {subTree.filter((o) => o.nodeType === 'TF' || o.nodeType === 'GROUP').map((o, i, a) => {
                let first = _(a).slice(0, i).filter((n) => n.parent === o.parent).size() === 0;
                if (o.nodeType === 'TF') {
                  return <Value key={o.id}
                                first={first}
                                node={o}/>;
                } else if (o.nodeType === 'GROUP') {
                  return <Group key={o.id}
                                first={first}
                                node={o}/>;
                }
              }).value()}
            </div>
          </div>
          <div className="row">
            {mods.size() ?
              <div className="col border border-light rounded bg-light m-2">
                <h3>Modifiers</h3>
                {mods.map((o, i, a) => {
                  let first = _(a).slice(0, i).filter((n) => n.parent === o.parent).size() === 0;
                  if (o.nodeType === 'MOD') {
                    return <Mod key={o.id} first={first} node={o}/>;
                  } else if (o.nodeType === 'MOD_GROUP') {
                    return <ModGroup key={o.id} first={first} node={o}/>;
                  }
                }).value()}
              </div> :
              null}
          </div>
        </div>
      </div>;
    }}</QueryContext.Consumer>;
  }
}

GroupBody.propTypes = {
  node: PropTypes.object,
  first: PropTypes.bool,
  addTF: PropTypes.func,
  addGroup: PropTypes.func,
  addMod: PropTypes.func,
  addModGroup: PropTypes.func,
  setQueryName: PropTypes.func,
  removeNode: PropTypes.func,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  setQueryOper: PropTypes.func,
  setQueryNot: PropTypes.func,
  moveItem: PropTypes.func,
  setParent: PropTypes.func
};

const Group = connect(mapStateToProps, {
  addTF,
  addGroup,
  addMod,
  addModGroup,
  setQueryName,
  removeNode,
  setQueryOper,
  setQueryNot,
  moveItem,
  setParent
})(GroupBody);

class QueryBoxBody extends React.Component {
  constructor(props) {
    super(props);
    this.dropTarget = React.createRef();
    this.queryDiv = React.createRef();
    this.state = {
      draggable: true,
      clientYOffset: 0
    };
  }

  setDraggable(draggable) {
    this.setState({
      draggable
    });
  }

  setClientYOffset(clientYOffset) {
    this.setState({
      clientYOffset
    });
  }

  render() {
    let {queryTree, setParent, moveItem} = this.props;
    let {draggable, clientYOffset} = this.state;

    return <div className={classNames("form-row", queryTree.length ? "border border-dark rounded py-3 mx-1" : null)}
                ref={this.dropTarget}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  let source_id = e.dataTransfer.getData('id');
                  let source = _.find(queryTree, ['id', source_id]);
                  if ((source.nodeType === 'TF' || source.nodeType === 'GROUP')) {
                    let target;
                    let after;
                    let currY = e.clientY - clientYOffset;
                    let _currNodesPos = _(this.queryDiv.current.children)
                      .invokeMap('getBoundingClientRect')
                      .map(_.unary(_.partial(_.pick, _, ['top', 'height'])))
                      .map((rect) => rect.top + rect.height / 2);


                    let prevPos = _currNodesPos.findLastIndex((p) => p < currY);
                    let nextPos = _currNodesPos.findIndex((p) => p > currY);

                    if (prevPos === -1) {
                      target = _.head(queryTree);
                      after = false;
                    } else if (nextPos === -1) {
                      target = _.last(queryTree);
                      after = true;
                    } else {
                      let currNodes = _.filter(queryTree, (o) => !o.parent);
                      target = currNodes[prevPos];
                      after = true;
                    }
                    moveItem(source_id, target.id, after);
                    setParent(source_id, undefined);
                  }
                }}>
      <div className="col" ref={this.queryDiv}>
        <QueryContext.Provider value={{
          draggable,
          setDraggable: this.setDraggable.bind(this),
          clientYOffset,
          setClientYOffset: this.setClientYOffset.bind(this)
        }}>
          {this.props.children}
        </QueryContext.Provider>
      </div>
    </div>;
  }
}

QueryBoxBody.propTypes = {
  children: PropTypes.node,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  moveItem: PropTypes.func,
  setParent: PropTypes.func
};

const QueryBox = connect(mapStateToProps, {
  moveItem,
  setParent
})(QueryBoxBody);

/**
 * Builds queries for tgdbbackend
 */
class QuerybuilderBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      targetGenes: [],
      targetGene: '',
      files: null
    };

    this.copy = React.createRef();
  }

  componentDidMount() {
    $.getJSON(`${BASE_URL}/api/lists/`)
      .done((targetGenes) => {
        this.setState({targetGenes});
      });

    this.clipboard = new Clipboard(this.copy.current, {
      text: () => {
        return this.props.query;
      }
    });
  }

  componentWillUnmount() {
    this.clipboard.destroy();
  }

  handleQuery(e) {
    this.props.setQuery(e.target.value);
  }

  handleSubmit(e) {
    e.preventDefault();
    let {query, setQuery} = this.props;
    let {targetGene, files} = this.state;
    let data = new FormData();

    if (!this.props.query) {
      query = this.buildQuery();
      setQuery(query);
    }

    data.append('query', query);

    if (targetGene === "other") {
      if (files && files.length) {
        data.set('targetgenes', files[0]);
      }
    } else {
      data.set('targetgenes', targetGene);
    }

    this.props.postQuery(data);
    this.props.history.push('/datagrid/table');
  }

  reset() {
    // add additional reset code
    try {
      this.targetGenes.current.value = null;
    } catch (e) {
      // Ignore for now
    }

    this.props.clearQuery();
    this.props.clearQueryTree();
    this.setState({
      targetGene: ""
    });
  }

  handleTargetGene(e) {
    this.setState({
      targetGene: e.target.value
    });
  }

  handleFile(files) {
    this.setState({files});
  }

  buildQuery() {
    let {queryTree} = this.props;
    return getQuery(queryTree);
  }

  setQuery() {
    this.props.setQuery(this.buildQuery());
  }

  render() {
    let {targetGenes, targetGene} = this.state;
    let {addTF, addGroup, queryTree} = this.props;

    return <div>
      <form onSubmit={this.handleSubmit.bind(this)}>
        <div className="container-fluid">

          <div className="row">
            <h2>Query</h2>
          </div>
          <div className="form-row m-1">
            <div className="col">
              <div className="btn-group">
                <button type="button" className="btn btn-success btn-lg"
                        onClick={addTF.bind(undefined, '', undefined, undefined, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add TF
                </button>
                <button type="button" className="btn btn-success btn-lg"
                        onClick={addGroup.bind(undefined, undefined, undefined, undefined, undefined)}>
                  <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add TF Group
                </button>
              </div>
            </div>
          </div>
          <QueryBox>
            {_(queryTree).filter((o) => _.isUndefined(o.parent)).map((o, i, a) => {
              let first = _(a).slice(0, i).filter((n) => n.parent === o.parent).size() === 0;
              if (o.nodeType === 'TF') {
                return <Value key={o.id}
                              first={first}
                              node={o}/>;
              } else if (o.nodeType === 'GROUP') {
                return <Group key={o.id} first={first} node={o}/>;
              }
            }).value()}
          </QueryBox>
          <div className="form-row">
            <div className="col m-2">
              <div className="input-group">
                <div className="input-group-prepend">
                  <button type="button" className="btn btn-outline-secondary btn-lg" ref={this.copy}>
                    <FontAwesomeIcon icon="copy" className="mr-1"/>Copy
                  </button>
                  <button type="button" className="btn btn-secondary btn-lg" onClick={this.setQuery.bind(this)}>
                    <FontAwesomeIcon icon="edit" className="mr-1"/>Build Query
                  </button>
                </div>
                <textarea className="form-control" value={this.props.query}
                          onChange={this.handleQuery.bind(this)} autoComplete="on"/>
                <div className="input-group-append">
                  <button type="submit" className="btn btn-primary btn-lg">
                    <FontAwesomeIcon icon="arrow-circle-up" className="mr-2"/>Submit
                  </button>
                  <button type="button" className="btn btn-outline-danger btn-lg" onClick={this.reset.bind(this)}>
                    <FontAwesomeIcon icon="redo" className="mr-2"/>Reset
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <h2>TargetGenes</h2>
          </div>
          <div className="form-row">
            <div className="input-group col">
              <select className="form-control mr-1" value={targetGene} onChange={this.handleTargetGene.bind(this)}>
                <option value="">----</option>
                {_.map(targetGenes, (l, i) => {
                  return <option key={i} value={l}>{l}</option>;
                })}
                <option value="other">Other</option>
              </select>
              {targetGene === "other" ?
                <TargetGenesFile handleChange={this.handleFile.bind(this)}/> :
                null}
            </div>
          </div>
        </div>
      </form>
    </div>;
  }
}

/**
 * @memberOf QuerybuilderBody
 */
QuerybuilderBody.propTypes = {
  history: PropTypes.object.isRequired,
  busy: PropTypes.bool,
  query: PropTypes.string,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  addTF: PropTypes.func,
  addGroup: PropTypes.func,
  postQuery: PropTypes.func,
  clearQuery: PropTypes.func,
  clearQueryTree: PropTypes.func,
  setQuery: PropTypes.func
};

const Querybuilder = connect(mapStateToProps, {
  postQuery,
  setQuery,
  clearQuery,
  addTF,
  addGroup,
  clearQueryTree
})(QuerybuilderBody);

export default Querybuilder;
