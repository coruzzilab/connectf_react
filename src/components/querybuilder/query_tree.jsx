/**
 * @author zacharyjuang
 * 2018-11-29
 */
import {connect} from "react-redux";
import {moveItem, setParent} from "../../actions";
import React from "react";
import _ from "lodash";
import {isTF} from "./utils";
import {DragContainer} from "./drag";
import classNames from "classnames";
import PropTypes from "prop-types";
import Value from "./value";
import Group from "./group";

const mapStateToProps = ({queryTree}) => {
  return {
    queryTree
  };
};

class QueryTreeBody extends React.Component {
  drop(clientYOffset, e) {
    let {queryTree, moveItem, setParent} = this.props;

    let sourceId = e.dataTransfer.getData('id');
    let source = _.find(queryTree, ['id', sourceId]);
    if (isTF(source)) {
      let target;
      let after;
      let currY = e.clientY - clientYOffset;
      let _currNodes = _(queryTree)
        .filter((o) => !o.parent);
      let _currNodesPos = _currNodes
        .map('id')
        .map(_.unary(document.getElementById.bind(document)))
        .invokeMap('getBoundingClientRect')
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
        let currNodes = _currNodes.value();
        target = currNodes[prevPos];
        after = true;
      }
      moveItem(sourceId, target.id, after);
      setParent(sourceId, undefined);
    }
  }

  render() {
    let {queryTree} = this.props;

    return <DragContainer
      className={classNames("row", queryTree.length ? "border border-dark rounded py-3 m-2" : null)}
      onDrop={this.drop.bind(this)}>
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
    </DragContainer>;
  }
}

QueryTreeBody.propTypes = {
  children: PropTypes.node,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  moveItem: PropTypes.func,
  setParent: PropTypes.func
};

const QueryTree = connect(mapStateToProps, {
  moveItem,
  setParent
})(QueryTreeBody);

export default QueryTree;
