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
import _ from "lodash";
import {isMod, isTF} from "./utils";
import {DragItem} from "./drag";
import {
  AddFollowing,
  AddModButton,
  AddModGroupButton,
  AddTFButton,
  AddTFGroupButton,
  AndOrSelect,
  DuplicateButton,
  NotSelect,
  RemoveButton
} from "./common";
import Value from "./value";
import Mod from "./mod";
import ModGroup from "./mod_group";
import PropTypes from "prop-types";

const mapStateToProps = ({queryTree}) => {
  return {
    queryTree
  };
};

class GroupBody extends React.Component {
  drop(clientYOffset, e) {
    let {node, queryTree, moveItem, setParent} = this.props;

    let sourceId = e.dataTransfer.getData('id');
    if (sourceId !== node.id) {
      let source = _.find(queryTree, ['id', sourceId]);
      let target;
      let after;
      let _currNodes;
      let currY = e.clientY - clientYOffset;

      if (isTF(source)) {
        _currNodes = _(queryTree)
          .filter(isTF)
          .filter((o) => o.parent === node.id);
      } else {
        _currNodes = _(queryTree)
          .filter(isMod)
          .filter((o) => o.parent === node.id);
      }

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

  render() {
    let {
      first, node, queryTree, removeNode, addTF, addGroup, addMod, addModGroup, setQueryNot, setQueryOper,
      duplicateNode
    } = this.props;
    let subTree = _(queryTree).filter((o) => o.parent === node.id);
    let mods = subTree.filter(isMod);

    return <DragItem node={node} onDrop={this.drop.bind(this)} className="row border border-dark rounded m-2 node">
      <div className="col">
        <div className="form-row my-2">
          <AndOrSelect className="col-1 mr-1" value={node.oper} handleChange={setQueryOper.bind(undefined, node.id)}
                       disable={first}/>
          <NotSelect className="col-1 mr-1" value={node.not_} handleChange={setQueryNot.bind(undefined, node.id)}/>
          <div className="btn-toolbar col">
            <div className="btn-group mr-1">
              <AddTFButton onClick={addTF.bind(undefined, '', node.id, undefined, undefined, undefined)}/>
              <AddTFGroupButton onClick={addGroup.bind(undefined, node.id, undefined, undefined, undefined)}/>
            </div>
            <div className="btn-group mr-1">
              <AddModButton
                onClick={addMod.bind(undefined, '', '', node.id, node.id, undefined, undefined, undefined)}/>
              <AddModGroupButton onClick={addModGroup.bind(undefined, node.id, node.id, undefined, undefined)}/>
            </div>
            <div className="btn-group">
              <RemoveButton onClick={removeNode.bind(undefined, node.id)}/>
            </div>
            <div className="btn-group ml-auto mr-1">
              <AddFollowing addNode={addTF.bind(undefined, '', node.parent, node.id, undefined, undefined)}
                            addGroup={addGroup.bind(undefined, node.parent, node.id, undefined, undefined)}/>
            </div>
            <div className="btn-group">
              <DuplicateButton onClick={duplicateNode.bind(undefined, node.id)}/>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col">
            {subTree.filter(isTF).map((o, i, a) => {
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
            <div className="col border border-light rounded bg-light m-2 node">
              <h3>Filters</h3>
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
    </DragItem>;
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
  setParent: PropTypes.func,
  duplicateNode: PropTypes.func
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
  setParent,
  duplicateNode
})(GroupBody);

export default Group;
