/**
 * @author zacharyjuang
 * 2018-11-29
 */
import {connect} from "react-redux";
import {
  addGroup,
  addMod,
  addModGroup,
  addTF,
  duplicateNode,
  moveItem,
  removeNode,
  setParent,
  setQueryName,
  setQueryNot,
  setQueryOper
} from "../../actions";
import React from "react";
import uuidv4 from "uuid/v4";
import {getTFs} from "../../utils/axios";
import _ from "lodash";
import {isMod, isTF} from "./utils";
import {DragItem, ImmobileInput} from "./drag";
import {
  AddModButton,
  AddModGroupButton,
  AddTFButton,
  AddTFGroupButton,
  AndOrSelect,
  DuplicateButton,
  NotSelect,
  RemoveButton
} from "./common";
import Mod from "./mod";
import ModGroup from "./mod_group";
import PropTypes from "prop-types";

const mapStateToProps = ({queryTree}) => {
  return {
    queryTree
  };
};

class ValueBody extends React.Component {
  constructor(props) {
    super(props);
    this.dropTarget = React.createRef();
    this.uuid = uuidv4();
    this.state = {
      dataSource: []
    };
  }

  componentDidMount() {
    this.getAutoComplete();
  }

  getAutoComplete() {
    getTFs().then(({data}) => {
      this.setState({dataSource: data});
    });
  }

  handleQueryName(id, e) {
    this.props.setQueryName(id, e.target.value);
  }

  drop(clientYOffset, e) {
    let {node, queryTree, moveItem, setParent} = this.props;

    let sourceId = e.dataTransfer.getData('id');
    if (sourceId !== node.id) {
      let source = _.find(queryTree, ['id', sourceId]);
      let rect = this.dropTarget.current.getBoundingClientRect();
      let after = e.clientY - clientYOffset - rect.top - rect.height / 2 >= 0;
      if (isTF(source)) {
        moveItem(sourceId, node.id, after);
        if (source.parent !== node.parent) {
          setParent(sourceId, node.parent);
        }
      } else if (isMod(source)) {
        let target;
        let after;
        let currY = e.clientY - clientYOffset;
        let _currNodes = _(queryTree)
          .filter(isMod)
          .filter((o) => o.parent === node.id);
        let _currNodesPos = _currNodes
          .map('id')
          .map(_.unary(document.getElementById.bind(document)))
          .invokeMap('getBoundingClientRect')
          .map((rect) => rect.top + rect.height / 2);


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
          moveItem(sourceId, target.id, after);
        }
        setParent(sourceId, node.id);
      }
    }
  }

  render() {
    let {
      first, node, addTF, addGroup, removeNode, setQueryNot, setQueryOper, addMod, addModGroup, queryTree,
      duplicateNode
    } = this.props;
    let {dataSource} = this.state;
    let subTree = _(queryTree).filter((o) => o.parent === node.id);
    let mods = subTree.filter(isMod);

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
              <ImmobileInput className="col"
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
            <div className="btn-group mr-1">
              <AddTFButton onClick={addTF.bind(undefined, '', node.parent, node.id, undefined, undefined)}/>
              <AddTFGroupButton onClick={addGroup.bind(undefined, node.parent, node.id, undefined, undefined)}/>
            </div>
            <div className="btn-group mr-1">
              <AddModButton
                onClick={addMod.bind(undefined, '', '', node.id, undefined, undefined, undefined, undefined)}/>
              <AddModGroupButton onClick={addModGroup.bind(undefined, node.id, undefined, undefined, undefined)}/>
            </div>
            <div className="btn-group">
              <RemoveButton onClick={removeNode.bind(undefined, node.id)}/>
            </div>
            <div className="btn-group ml-auto">
              <DuplicateButton onClick={duplicateNode.bind(undefined, node.id)}/>
            </div>
          </div>
        </div>
        {mods.map((o, i, a) => {
          let first = _(a).slice(0, i).filter((n) => n.parent === o.parent).size() === 0;
          if (o.nodeType === 'MOD') {
            return <Mod key={o.id} first={first} node={o}/>;
          } else if (o.nodeType === 'MOD_GROUP') {
            return <ModGroup key={o.id} first={first} node={o}/>;
          }
        }).value()}
      </div>
    </DragItem>;
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
  setParent: PropTypes.func,
  duplicateNode: PropTypes.func
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
  setParent,
  duplicateNode
})(ValueBody);

export default Value;
