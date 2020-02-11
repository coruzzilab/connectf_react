import _ from "lodash";
import PropTypes from "prop-types";
import React, {useEffect, useState} from "react";
import classNames from "classnames";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import {Collapse} from "reactstrap";

function groupEdges(edges, n = 0) {
  return _(edges).groupBy(_.partial(_.get, _, `[0][${n}]`)).reduce((acc, val, key) => {
    if (_(val).map((v) => v[0].length > n + 1).some()) {
      acc[key] = groupEdges(val, n + 1);
    } else {
      acc[key] = val[0];
    }
    return acc;
  }, {});
}

function checkChildren(groupedEdges, onChange) {
  _.forEach(groupedEdges, (val) => {
    if (_.isArray(val)) {
      onChange(val[1]);
    } else {
      checkChildren(val, onChange);
    }
  });
}

function checkChecked(groupedEdges, edges) {
  if (_.isArray(groupedEdges)) {
    return _.indexOf(edges, groupedEdges[1]) !== -1;
  }

  return _(groupedEdges).map((val) => {
    return checkChecked(val, edges);
  }).some();
}

const EdgeTree = ({groupedEdges, edges, onChange, n}) => {
  return <ul style={{listStyleType: 'none'}} className={classNames("list-group", n === 0 && 'list-group-horizontal')}>
    {_.map(groupedEdges, (val, key) => {
      if (_.isArray(val)) {
        return <li key={key} className="list-group-item border-0">
          <div className="form-check form-check-inline">
            <div className="d-inline mr-1"><Icon icon="plus" className="invisible"/></div>
            <label className="form-check-label">
              <input type="checkbox" className="form-check-input"
                     checked={_.indexOf(edges, val[1]) !== -1}
                     onChange={onChange.bind(undefined, val[1])}/>{val[0][n] || val[0][n - 1]}
            </label>
          </div>
        </li>;
      }

      let checked = checkChecked(val, edges);
      let [isOpen, setIsOpen] = useState(checked);

      return <li key={key} className="list-group-item border-0">
        <div className="form-check form-check-inline">
          <div className="d-inline mr-1"
               onClick={setIsOpen.bind(undefined, !isOpen)}>{isOpen ? <Icon icon="minus"/> : <Icon icon="plus"/>}</div>
          <label className="form-check-label">
            <input type="checkbox" className="form-check-input"
                   checked={checked}
                   onChange={(e) => {
                     setIsOpen(e.target.checked);
                     if (e.target.checked) {  // check "first"
                       onChange(val[Object.keys(val)[0]][1], e);
                     }

                     if (!e.target.checked) {
                       checkChildren(val, _.partial(onChange, _, e));
                     }
                   }}/>{key}</label>
        </div>
        <Collapse isOpen={isOpen}>
          <EdgeTree groupedEdges={val} edges={edges} onChange={onChange} n={n + 1}/>
        </Collapse>
      </li>;
    })}
  </ul>;
};

EdgeTree.propTypes = {
  groupedEdges: PropTypes.object.isRequired,
  edges: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  n: PropTypes.number
};

EdgeTree.defaultProps = {
  n: 0
};

/**
 * @author zacharyjuang
 * 2/11/20
 */
const Edges = ({edgeList, edges, onChange}) => {
  let [groupedEdges, setGroupedEdges] = useState({});

  useEffect(() => {
    setGroupedEdges(groupEdges(_.map(edgeList, (e) => [e.split('/'), e])));
  }, [edgeList]);

  console.log(groupedEdges);

  return <div className="row">
    <div className="col">
      <div className="row m-2">
        <h4>Additional Edge Features</h4>
      </div>
      <div className="row m-2">
        <div className="col">
          <EdgeTree groupedEdges={groupedEdges} edges={edges} onChange={onChange}/>
        </div>
      </div>
    </div>
  </div>;
};

Edges.propTypes = {
  edgeList: PropTypes.array.isRequired,
  edges: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export default Edges;
