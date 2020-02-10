/**
 * @author zacharyjuang
 * 12/19/19
 */
import React, {useRef, useState} from "react";
import _ from "lodash";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";

export const MotifAdder = ({className, motifs, selectedMotifs, setSelectedMotifs}) => {
  let [isOpen, setIsOpen] = useState(false);

  let selectRef = useRef(null);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const handleAdd = () => {
    setSelectedMotifs(_.map(selectedMotifs, (s) => {
      return _.uniq([...s, selectRef.current.value]);
    }));
  };

  const handleRemove = (m) => {
    setSelectedMotifs(_.map(selectedMotifs, (s) => {
      return s.filter((n) => n !== m);
    }));
  };

  const handleClear = () => {
    setSelectedMotifs(_.map(selectedMotifs, () => []));
  };

  let commonMotifs = _.reduce(selectedMotifs, _.ary(_.intersection, 2));

  return <div className={className}>
    <button className="btn btn-primary" onClick={toggle}>Add/Remove Motifs</button>
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Motifs</ModalHeader>
      <ModalBody>
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              {_.map(commonMotifs, (m, i) => (<button key={i} className="btn btn-primary m-1"
                                                      onClick={handleRemove.bind(undefined, m)}>
                {m} <Icon icon="times-circle"/>
              </button>))}
            </div>
          </div>
          {_.size(commonMotifs) ? <hr/> : null}
          <div className="row">
            <div className="col">
              <div className="form-inline">
                <select ref={selectRef} className="form-control" style={{width: "80%", textOverflow: "ellipsis"}}>
                  {_.map(motifs, (m, i) => <option value={m} key={i}>{m}</option>)}
                </select>
                <button className="btn btn-primary" style={{width: "20%"}} onClick={handleAdd}>Add</button>
              </div>
            </div>
          </div>
          <hr/>
          <div className="row">
            <div className="col">
              <button className="btn btn-danger" onClick={handleClear}>Clear All</button>
            </div>
          </div>
        </div>
      </ModalBody>
      <ModalFooter>
        <button className="btn btn-primary" onClick={toggle}>Close</button>
      </ModalFooter>
    </Modal>
  </div>;
};

MotifAdder.propTypes = {
  className: PropTypes.string,
  motifs: PropTypes.array,
  selectedMotifs: PropTypes.array,
  setSelectedMotifs: PropTypes.func
};

export default MotifAdder
