/**
 * @author zacharyjuang
 * 2018-11-29
 */
import React from "react";
import uuidv4 from "uuid/v4";
import _ from "lodash";
import {getParentTfTree} from "../../utils";
import {getKeys, getKeyValues} from "../../utils/axios_instance";
import {isMod} from "./utils";
import {DragItem, ImmobileInput} from "./drag";
import {AddModButton, AddModGroupButton, AndOrSelect, DuplicateButton, NotSelect, RemoveButton} from "./common";
import classNames from "classnames";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {
  addMod,
  addModGroup,
  duplicateNode,
  moveItem,
  removeNode,
  setModInnerOper,
  setModKey,
  setModValue,
  setParent,
  setQueryNot,
  setQueryOper
} from "../../actions";

function mapStateToProps({queryTree}) {
  return {
    queryTree
  };
}

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
    if (node.key && node.key !== prevProps.node.key) {
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

    getKeys(data).then(({data}) => {
      this.setState({dataSource: data});
      if (!node.key) {
        this.props.setModKey(node.id, _.head(data));
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

    getKeyValues(this.props.node.key, data).then((response) => {
      this.setState({dataSourceValues: response.data});
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

  drop(clientYOffset, e) {
    let {node, queryTree, moveItem, setParent} = this.props;

    let sourceId = e.dataTransfer.getData('id');
    if (sourceId !== node.id) {
      let source = _.find(queryTree, ['id', sourceId]);
      if (isMod(source)) {
        let rect = this.dropTarget.current.getBoundingClientRect();
        let after = e.clientY - clientYOffset - rect.top - rect.height / 2 >= 0;
        moveItem(sourceId, node.id, after);
        if (source.parent !== node.parent) {
          setParent(sourceId, node.parent);
        }
      }
    }
  }

  isNumericKey() {
    return this.props.node.key === 'pvalue' || this.props.node.key === 'fc';
  }

  render() {
    let {
      first, node, addMod, addModGroup, removeNode, setQueryNot, setQueryOper, duplicateNode
    } = this.props;
    let {dataSource, dataSourceValues} = this.state;

    return <DragItem node={node} onDrop={this.drop.bind(this)} className="row border border-dark rounded m-2 node"
                     ref={this.dropTarget}>
      <div className="col">
        <div className="row my-2">
          <div className="col">
            <div className="form-row">
              <AndOrSelect className="col-1 mr-1" value={node.oper}
                           handleChange={setQueryOper.bind(undefined, node.id)}
                           disable={first}/>
              <NotSelect className="col-1 mr-1" value={node.not_}
                         handleChange={setQueryNot.bind(undefined, node.id)}/>
              <select
                className={classNames("form-control mr-1", this.isNumericKey() ? 'col-3' : 'col-4')}
                onChange={this.setModKey.bind(this)} value={node.key}>
                {_.map(dataSource, (o, i) => {
                  return <option key={i}>{o}</option>;
                })}
              </select>
              {this.isNumericKey() ?
                <select className="form-control col-1 mr-1" value={node.innerOper}
                        onChange={this.setModInnerOper.bind(this)}>
                  <option>=</option>
                  <option>&lt;</option>
                  <option>&gt;</option>
                  <option>&lt;=</option>
                  <option>&gt;=</option>
                </select> :
                null}
              <ImmobileInput className="col"
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
              <div className="btn-group mr-1">
                <AddModButton
                  onClick={addMod.bind(undefined, '', '', node.parent, node.id, undefined, undefined, undefined)}/>
                <AddModGroupButton onClick={addModGroup.bind(undefined, node.parent, node.id, undefined, undefined)}/>
              </div>
              <div className="btn-group">
                <RemoveButton onClick={removeNode.bind(undefined, node.id)}/>
              </div>
              <div className="btn-group ml-auto">
                <DuplicateButton onClick={duplicateNode.bind(undefined, node.id)}/>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DragItem>;
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
  setParent: PropTypes.func,
  duplicateNode: PropTypes.func
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
  setParent,
  duplicateNode
})(ModBody);

export default Mod;
