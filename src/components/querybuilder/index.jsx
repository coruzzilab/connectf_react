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
  clearQueryTree
} from '../../actions';
import {getQuery, getParentTfTree} from "../../utils";

const mapStateToProps = ({busy, query, queryTree}) => {
  return {
    busy,
    query,
    queryTree
  };
};


class AndOrSelect extends React.Component {
  handleChange(e) {
    this.props.handleChange(e.target.value);
  }

  render() {
    let {value} = this.props;
    return <select className="form-control" style={{float: 'left'}} value={value}
                   onChange={this.handleChange.bind(this)}>
      <option>or</option>
      <option>and</option>
    </select>;
  }
}

AndOrSelect.propTypes = {
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired
};


class NotSelect extends React.Component {
  handleChange(e) {
    this.props.handleChange(e.target.value === 'not');
  }

  render() {
    let {value} = this.props;

    return <select className="form-control" style={{float: 'left'}}
                   onChange={this.handleChange.bind(this)}
                   value={value ? 'not' : '-'}>
      <option>-</option>
      <option>not</option>
    </select>;
  }
}

NotSelect.propTypes = {
  value: PropTypes.bool.isRequired,
  handleChange: PropTypes.func.isRequired
};


class ModBody extends React.Component {
  constructor(props) {
    super(props);
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
    let {first, node, addMod, addModGroup, removeNode, setQueryNot, setQueryOper} = this.props;
    let {dataSource, dataSourceValues} = this.state;

    return <div className="alert form-inline alert-warning alert-group group">
      {!first ?
        <AndOrSelect value={node.oper} handleChange={setQueryOper.bind(undefined, node.id)}/> :
        null}
      <NotSelect value={node.not_} handleChange={setQueryNot.bind(undefined, node.id)}/>
      <div style={{display: 'inline-block'}}>
        <select className="form-control" onChange={this.setModKey.bind(this)} value={node.key}>
          {_.map(dataSource, (o, i) => {
            return <option key={i}>{o}</option>;
          })}
        </select>
        {node.key === 'pvalue' || node.key === 'fc' ?
          <select className="form-control" value={node.innerOper} onChange={this.setModInnerOper.bind(this)}>
            <option>=</option>
            <option>&lt;</option>
            <option>&gt;</option>
            <option>&lt;=</option>
            <option>&gt;=</option>
          </select> :
          null}
        <input className="form-control"
               list={this.uuid}
               style={{width: '30em', height: '34px'}} // @todo: better CSS styling
               size="large"
               onChange={this.setModValue.bind(this)} value={node.value}/>
        <datalist id={this.uuid}>
          {_.map(dataSourceValues, (o, i) => {
            return <option key={i}>{o}</option>;
          })}
        </datalist>
      </div>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addMod.bind(undefined, '', '', node.parent, node.id, undefined, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Modifier
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addModGroup.bind(undefined, node.parent, node.id, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Modifier Group
      </button>
      <button className="btn btn-sm btn-danger" style={{verticalAlign: 'middle', float: 'right'}}
              onClick={removeNode.bind(undefined, node.id)}>
        <span className="glyphicon glyphicon-minus-sign"/>
      </button>
    </div>;
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
  setModInnerOper: PropTypes.func
};

const Mod = connect(mapStateToProps, {
  removeNode,
  setQueryOper,
  setQueryNot,
  addMod,
  addModGroup,
  setModKey,
  setModValue,
  setModInnerOper
})(ModBody);

class ModGroupBody extends React.Component {
  render() {
    let {first, node, queryTree, removeNode, addMod, addModGroup, setQueryNot, setQueryOper} = this.props;


    let subTree = _(queryTree).filter((o) => o.parent === node.id);

    return <div className="alert form-inline alert-warning alert-group group">
      {!first ?
        <AndOrSelect value={node.oper} handleChange={setQueryOper.bind(undefined, node.id)}/> :
        null}
      <NotSelect value={node.not_} handleChange={setQueryNot.bind(undefined, node.id)}/>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addMod.bind(undefined, '', '', node.id, node.id, undefined, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Modifier
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addModGroup.bind(undefined, node.id, node.id, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Modifier Group
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-danger"
              onClick={removeNode.bind(undefined, node.id)}>
        <span className="glyphicon glyphicon-minus-sign"/> Remove Modifier Group
      </button>
      <button style={{marginLeft: '5px', float: 'right'}} className="btn btn-sm btn-success"
              onClick={addModGroup.bind(undefined, node.parent, node.id, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add TF Proceeding Modifier Group
      </button>
      <button style={{marginLeft: '5px', float: 'right'}} className="btn btn-sm btn-success"
              onClick={addMod.bind(undefined, '', '', node.parent, node.id, undefined, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Proceeding Modifier
      </button>
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
    </div>;
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
  setQueryNot: PropTypes.func
};

const ModGroup = connect(mapStateToProps, {
  addMod,
  addModGroup,
  setQueryName,
  removeNode,
  setQueryOper,
  setQueryNot
})(ModGroupBody);

class ValueBody extends React.Component {
  constructor(props) {
    super(props);
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
    let {first, node, addTF, addGroup, removeNode, setQueryNot, setQueryOper, addMod, addModGroup, queryTree} = this.props;
    let {dataSource} = this.state;
    let subTree = _(queryTree).filter((o) => o.parent === node.id);
    let mods = subTree.filter((o) => o.nodeType === 'MOD' || o.nodeType === 'MOD_GROUP');

    return <div className="alert form-inline alert-warning alert-group group">
      {!first ?
        <AndOrSelect value={node.oper} handleChange={setQueryOper.bind(undefined, node.id)}/> :
        null}
      <NotSelect value={node.not_} handleChange={setQueryNot.bind(undefined, node.id)}/>
      <div style={{display: 'inline-block'}}>
        <input className="form-control"
               list={this.uuid}
               style={{width: '30em', height: '34px'}} // @todo: better CSS styling
               size="large" onChange={this.handleQueryName.bind(this, node.id)} value={node.name}/>
        <datalist id={this.uuid}>
          {_.map(dataSource, (o, i) => {
            return <option value={o.value} key={i}>{o.name}</option>;
          })}
        </datalist>
      </div>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addTF.bind(undefined, '', node.parent, node.id, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add TF
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addGroup.bind(undefined, node.parent, node.id, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Group
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addMod.bind(undefined, '', '', node.id, undefined, undefined, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Modifier
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addModGroup.bind(undefined, node.id, undefined, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Modifier Group
      </button>
      <button className="btn btn-sm btn-danger" style={{verticalAlign: 'middle', float: 'right'}}
              onClick={removeNode.bind(undefined, node.id)}>
        <span className="glyphicon glyphicon-minus-sign"/>
      </button>
      {mods.map((o, i, a) => {
        let first = _(a).slice(0, i).filter((n) => n.parent === o.parent).size() === 0;
        if (o.nodeType === 'MOD') {
          return <Mod key={o.id} first={first} node={o}/>;
        } else if (o.nodeType === 'MOD_GROUP') {
          return <ModGroup key={o.id} first={first} node={o}/>;
        }
      }).value()}
    </div>;
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
  queryTree: PropTypes.arrayOf(PropTypes.object)
};

const Value = connect(mapStateToProps, {
  addTF,
  addGroup,
  setQueryName,
  removeNode,
  setQueryOper,
  setQueryNot,
  addMod,
  addModGroup
})(ValueBody);

class GroupBody extends React.Component {
  render() {
    let {first, node, queryTree, removeNode, addTF, addGroup, addMod, addModGroup, setQueryNot, setQueryOper} = this.props;
    let subTree = _(queryTree).filter((o) => o.parent === node.id);
    let mods = subTree.filter((o) => o.nodeType === 'MOD' || o.nodeType === 'MOD_GROUP');

    return <div className="alert form-inline alert-warning alert-group group">
      {!first ?
        <AndOrSelect value={node.oper} handleChange={setQueryOper.bind(undefined, node.id)}/> :
        null}
      <NotSelect value={node.not_} handleChange={setQueryNot.bind(undefined, node.id)}/>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addTF.bind(undefined, '', node.id, undefined, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add TF
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addGroup.bind(undefined, node.id, undefined, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add TF Group
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addMod.bind(undefined, '', '', node.id, node.id, undefined, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Modifier
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
              onClick={addModGroup.bind(undefined, node.id, node.id, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Modifier Group
      </button>
      <button style={{marginLeft: '5px'}} className="btn btn-sm btn-danger"
              onClick={removeNode.bind(undefined, node.id)}>
        <span className="glyphicon glyphicon-minus-sign"/> Remove TF Group
      </button>
      <button style={{marginLeft: '5px', float: 'right'}} className="btn btn-sm btn-success"
              onClick={addGroup.bind(undefined, node.parent, node.id, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add TF Proceeding Group
      </button>
      <button style={{marginLeft: '5px', float: 'right'}} className="btn btn-sm btn-success"
              onClick={addTF.bind(undefined, '', node.parent, node.id, undefined, undefined)}>
        <span className="glyphicon glyphicon-plus-sign"/> Add Proceeding TF
      </button>
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
      {mods.size() ?
        <div className="alert form-inline alert-warning alert-group group">
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
    </div>;
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
  setQueryNot: PropTypes.func
};

const Group = connect(mapStateToProps, {
  addTF,
  addGroup,
  addMod,
  addModGroup,
  setQueryName,
  removeNode,
  setQueryOper,
  setQueryNot
})(GroupBody);

/**
 * Builds queries for tgdbbackend
 */
class QuerybuilderBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      targetGenes: [],
      targetGene: ''
    };
    this.targetGenes = React.createRef();
    this.copy = React.createRef();
  }

  componentDidMount() {
    $.getJSON(`${BASE_URL}/api/lists/`)
      .done((targetGenes) => {
        this.setState({targetGenes});
      });

    this.clipboard = new Clipboard(this.copy.current, {
      text: (trigger) => {
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
    let {query} = this.props;
    let {targetGene} = this.state;
    let {targetGenes} = this;
    let data = new FormData();

    if (!this.props.query) {
      query = this.buildQuery();
    }

    data.append('query', query);

    if (targetGene === "other") {
      let f = _.get(targetGenes.current, 'files.0');
      if (f && f.size > 0) {
        data.set('targetgenes', _.get(targetGenes.current, 'files.0'));
      }
    } else {
      data.set('targetgenes', targetGene);
    }

    this.props.postQuery(data);
    this.props.history.push('/datagrid');
  }

  reset() {
    // add additional reset code
    try {
      this.targetGenes.current.value = null;
    } catch (e) {
      console.log("no file selected");
    }

    this.props.clearQuery();
    this.props.clearQueryTree();
  }

  handleTargetGene(e) {
    this.setState({
      targetGene: e.target.value
    });
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

    return <div style={{display: "flex", flexDirection: "row"}}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 90
      }}>
        <div>
          <h1>Query</h1>
          <div className="alert form-inline alert-warning alert-group group">
            <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
                    onClick={addTF.bind(undefined, '', undefined, undefined, undefined, undefined)}>
              <span className="glyphicon glyphicon-plus-sign"/> Add TF
            </button>
            <button style={{marginLeft: '5px'}} className="btn btn-sm btn-success"
                    onClick={addGroup.bind(undefined, undefined, undefined, undefined, undefined)}>
              <span className="glyphicon glyphicon-plus-sign"/> Add TF Group
            </button>
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
          </div>
          <button className="btn btn-default" onClick={this.setQuery.bind(this)}>Build Query</button>
          <button className="btn btn-default" ref={this.copy}>Copy</button>
          <textarea className="form-control" rows="5" style={{width: "100%"}} value={this.props.query}
                    onChange={this.handleQuery.bind(this)} autoComplete="on"/>
        </div>

        <div style={{marginBottom: '2em'}}>
          <h2>TargetGenes</h2>
          <select className="form-control" value={targetGene} onChange={this.handleTargetGene.bind(this)}>
            <option value="">----</option>
            {_.map(targetGenes, (l, i) => {
              return <option key={i} value={l}>{l}</option>;
            })}
            <option value="other">Other</option>
          </select>
          {targetGene === "other" ?
            <input type="file" className="form-control form-control-file"
                   ref={this.targetGenes}/> :
            null}

        </div>
      </div>

      <div style={{flex: 20}}>
        <button type="submit" className="btn btn-default" onClick={this.handleSubmit.bind(this)}>Submit</button>
        <button type="button" className="btn btn-danger" onClick={this.reset.bind(this)}>Reset</button>
      </div>
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
