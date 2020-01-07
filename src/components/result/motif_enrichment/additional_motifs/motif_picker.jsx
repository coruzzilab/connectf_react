/**
 * @author zacharyjuang
 * 12/19/19
 */
import React, {useRef, useState} from "react";
import _ from "lodash";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";

const MotifPicker = ({motifs, value, onChange}) => {
  let [isOpen, setIsOpen] = useState(false);
  let selectRef = useRef(null);

  const toggle = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (e) => {
    onChange(_(e.target.options).filter((o) => o.selected).map('value').value());
  };

  const handleRemove = (m) => {
    onChange(value.filter((v) => v !== m));
  };

  const handleSearch = (e) => {
    if (!e.target.value) {
      return;
    }
    let r = new RegExp(_.escapeRegExp(e.target.value), 'i');
    let option = _.find(selectRef.current.options, (o) => r.test(o.value));
    if (option) {
      selectRef.current.scroll({
        top: option.offsetTop,
        left: 0,
        behavior: 'auto'
      });
    }
  };

  return <div>
    <button className="btn btn-primary" onClick={toggle}>Select Motifs</button>
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Motifs</ModalHeader>
      <ModalBody>
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              {_.map(value, (m, i) => (<button key={i} className="btn btn-primary m-1"
                                               onClick={handleRemove.bind(undefined, m)}>
                {m} <Icon icon="times-circle"/>
              </button>))}
            </div>
          </div>
          {_.size(value) ? <hr/> : null}
          <div className="row mb-1">
            <div className="col">
              <input type="text" className="form-control" placeholder="Search" onChange={handleSearch}/>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <select multiple value={value} onChange={handleSelect} ref={selectRef} className="form-control">
                {_.map(motifs, (m, i) => <option value={m} key={i}>{m}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <span className="text-secondary">Hold Ctrl or Shift to select multiple</span>
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

MotifPicker.propTypes = {
  motifs: PropTypes.array,
  value: PropTypes.array,
  onChange: PropTypes.func
};

export default MotifPicker;
