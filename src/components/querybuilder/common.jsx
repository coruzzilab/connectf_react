/**
 * @author zacharyjuang
 * 8/25/18
 */
import React, {useState} from "react";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  PopoverBody,
  PopoverHeader,
  UncontrolledDropdown,
  UncontrolledPopover
} from "reactstrap";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash";
import {EditToggleInput, ExportModal, InfoPopover} from "../common";
import styled from "styled-components";
import {connect} from 'react-redux';
import {clearList, removeList, renameList} from "../../actions";

export class AndOrSelect extends React.Component {
  handleChange(e) {
    this.props.handleChange(e.target.value);
  }

  render() {
    let {value, className, disable} = this.props;
    return <select className={classNames("form-control first-input", className)} value={value}
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

export class NotSelect extends React.Component {
  handleChange(e) {
    this.props.handleChange(e.target.value === 'not');
  }

  render() {
    let {value, className} = this.props;

    return <select className={classNames("form-control", className)}
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

export const AddFollowing = (props) => {
  return <UncontrolledDropdown>
    <DropdownToggle className="btn btn-light"><Icon icon="plus-circle"/></DropdownToggle>
    <DropdownMenu right>
      <DropdownItem onClick={props.addNode}>
        <Icon icon="plus-circle" className="mr-1"/>{props.addNodeText}
      </DropdownItem>
      <DropdownItem onClick={props.addGroup}>
        <Icon icon="plus-circle" className="mr-1"/>{props.addGroupText}
      </DropdownItem>
    </DropdownMenu>
  </UncontrolledDropdown>;
};

AddFollowing.propTypes = {
  addNode: PropTypes.func,
  addNodeText: PropTypes.node,
  addGroup: PropTypes.func,
  addGroupText: PropTypes.node
};

AddFollowing.defaultProps = {
  addNodeText: 'Add Following TF',
  addGroupText: 'Add Following TF Group'
};

export const UploadFile = ({className, onChange, save, ...props}) => {
  let [genes, setGenes] = useState("");
  let [isOpen, setIsOpen] = useState(false);

  let onFileChange = (e) => {
    let file = e.target.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = (e) => {
        let result = e.target.result;
        setGenes(result);
        onChange(file.name, result);
      };
      reader.readAsText(file);
    }
  };

  return <div className={classNames("row", className)}>
    <div className={classNames("pr-1", save ? "col-11" : "col")}>
      <input type="file" className="form-control-file" onChange={onFileChange} {...props} />
    </div>
    {save ?
      <div className="col-1 pl-1">
        <button type="button" className="btn btn-primary btn-block"
                disabled={!genes}
                onClick={setIsOpen.bind(undefined, !isOpen)}>
          <Icon icon="save" className="mr-1"/>Save
        </button>
      </div> :
      null}
    <ExportModal isOpen={isOpen} toggle={setIsOpen.bind(undefined, !isOpen)} genes={genes} addHeader={false}/>
  </div>;
};

UploadFile.propTypes = {
  save: PropTypes.bool,
  inputRef: PropTypes.object,
  className: PropTypes.string,
  onChange: PropTypes.func
};

UploadFile.defaultProps = {
  save: true
};


const TARGET_GENES_FILE = ">list 1 name\nAT1G00100\nAT1G00200\n...\n>list 2 name (optional)\nAT2G00100\nAT2G00200\n...\n";

export const TargetGeneInfo = () => {
  return <InfoPopover>
    <PopoverHeader>Target Genes</PopoverHeader>
    <PopoverBody>
      <p>Choose from predefined gene lists or upload your own.</p>
      <p>Target Gene List file format:</p>
      <pre className="code">
            <code>
              {TARGET_GENES_FILE}
            </code>
          </pre>
      <a href={"data:text/plain," + encodeURIComponent(TARGET_GENES_FILE)}
         className="btn btn-primary btn-sm" download>
        <Icon icon="file-download" className="mr-1"/>Download Example
      </a>
    </PopoverBody>
  </InfoPopover>;
};

const FILTER_TF_FILE = "AT1G00100\nAT1G00200\n...\n";

export const FilterTfInfo = () => {
  return <InfoPopover>
    <PopoverHeader>Filter TFs</PopoverHeader>
    <PopoverBody>
      <p>Choose from predefined gene lists or upload your own.</p>
      <p>Filter List file format:</p>
      <pre className="code">
            <code>
              {FILTER_TF_FILE}
            </code>
          </pre>
      <a href={"data:text/plain," + encodeURIComponent(FILTER_TF_FILE)}
         className="btn btn-primary btn-sm" download>
        <Icon icon="file-download" className="mr-1"/>Download Example
      </a>
    </PopoverBody>
  </InfoPopover>;
};

const TARGET_NETWORK_FILE = "source edge target score\n" +
  "AT1G00100 edge_name AT1G00200 17.3\n" +
  "AT1G00100 edge_name AT1G00300 16.2\n";

const TARGET_NETWORK_NS_FILE = "source edge target\n" +
  "AT1G00100 edge_name AT1G00200\n" +
  "AT1G00100 edge_name AT1G00300\n";

export const NetworkInfo = () => {
  return <InfoPopover>
    <PopoverHeader>Target Network</PopoverHeader>
    <PopoverBody>
      <p>Choose from predefined gene lists or upload your own.</p>
      <p>Space or Tab separated file with 3 columns: source, edge target.
        With an optional 4th column of scores. If no scores are present, the
        query assumes that the edges are ranked.</p>
      <p>Target Network file format:</p>
      <pre className="code">
            <code>
              {TARGET_NETWORK_FILE}
            </code>
          </pre>
      <p>Optionally:</p>
      <pre className="code">
            <code>
              {TARGET_NETWORK_NS_FILE}
            </code>
          </pre>
      <a href={"data:text/plain," + encodeURIComponent(TARGET_NETWORK_FILE)}
         className="btn btn-primary btn-sm" download>
        <Icon icon="file-download" className="mr-1"/>Download Example
      </a>
    </PopoverBody>
  </InfoPopover>;
};

export const AddTFButton = ({onClick, large}) => (
  <button type="button"
          title="Add Transcription Factor"
          className={classNames("btn btn-success", large ? "btn-lg" : null)}
          onClick={onClick}>
    <Icon icon="plus-circle" className="mr-1"/>Add TF
  </button>);

AddTFButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  large: PropTypes.bool
};

export const AddTFGroupButton = ({onClick, large}) => (
  <button type="button"
          title="Add Transcription Factor Group"
          className={classNames("btn btn-success", large ? "btn-lg" : null)}
          onClick={onClick}>
    <Icon icon="plus-circle" className="mr-1"/>Add TF Group
  </button>);

AddTFGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  large: PropTypes.bool
};

export const AddModButton = ({onClick}) => (
  <button type="button" className="btn btn-success"
          onClick={onClick}>
    <Icon icon="plus-circle" className="mr-1"/>Add Filter
  </button>);

AddModButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export const AddModGroupButton = ({onClick}) => (
  <button type="button" className="btn btn-success"
          onClick={onClick}>
    <Icon icon="plus-circle" className="mr-1"/>Add Filter Group
  </button>);

AddModGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export const DuplicateButton = ({onClick}) => (
  <button type="button" className="btn btn-light"
          onClick={onClick}
          title="Duplicate Item">
    <Icon icon="clone"/>
  </button>);

DuplicateButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export const RemoveButton = ({onClick}) => (
  <button type="button" className="btn btn-danger" title="Remove"
          onClick={onClick}>
    <Icon icon="minus-circle"/>
  </button>);

RemoveButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export const Copied = ({copied}) => (
  <span><Icon icon="copy" className="mr-1"/>{copied ? "Copied!" : "Copy"}</span>);

Copied.propTypes = {
  copied: PropTypes.bool
};

Copied.defaultProps = {
  copied: false
};

const CursorHelp = styled.span`
cursor: help;
text-decoration: underline dotted;
`;

export const QueryInfo = () => {
  return <div className="form-row m-2">
    <div className="col">
      <CursorHelp className="small text-secondary" id="queryInfo"><Icon icon="question-circle"/> more
        info</CursorHelp>
      <UncontrolledPopover trigger="hover" target="queryInfo" delay={0}>
        <PopoverHeader>Query Info</PopoverHeader>
        <PopoverBody>
          <h6>Info on additional keywords:</h6>
          <ul>
            <li><span className="font-weight-bold">all_tf</span> — Query the union of all Transcription Factors in the
              database, a filter is recommended to decrease the amount of returned data.
            </li>
            <li><span className="font-weight-bold">multitype</span> — Query Transcription Factors that have multiple
              experiment types.
            </li>
          </ul>
          <p>These keywords can be used in place of Transcription Factor IDs.</p>
        </PopoverBody>
      </UncontrolledPopover>
    </div>
  </div>;
};

const ClearListButtonBody = ({clearList}) => {
  return <button type="button" className="btn btn-danger" onClick={clearList}>
    <Icon icon="trash-alt"/> Clear Saved Lists
  </button>;
};

ClearListButtonBody.propTypes = {
  clearList: PropTypes.func
};

export const ClearListButton = connect(null, {clearList})(ClearListButtonBody);

const RemoveListButtonBody = ({removeList, renameList, tempLists}) => {
  let [isOpen, setIsOpen] = useState(false);
  let toggle = setIsOpen.bind(undefined, !isOpen);

  return <div className="d-inline-block mr-1">
    <button type="button" className="btn btn-primary" onClick={toggle}><Icon icon="trash-alt"/> Remove List</button>
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>Remove List</ModalHeader>
      <ModalBody>
        {_(tempLists)
          .keys()
          .map((name, i) => {
            let onRename = (e) => {
              renameList(name, e.target.value);
            };
            return <div key={i} className="form-inline mb-2">
            <span className="text-secondary link mr-1" title="remove" onClick={removeList.bind(undefined, name)}>
              <Icon icon="times-circle"/></span>
              <EditToggleInput value={name} onChange={onRename}/>
            </div>;
          })
          .value()}
      </ModalBody>
      <ModalFooter>
        <button type="button" className="btn btn-secondary" onClick={toggle}>Close</button>
      </ModalFooter>
    </Modal>
  </div>;
};

RemoveListButtonBody.propTypes = {
  removeList: PropTypes.func,
  renameList: PropTypes.func,
  tempLists: PropTypes.object
};

export const RemoveListButton = connect(({tempLists}) => ({tempLists}), {removeList, renameList})(RemoveListButtonBody);

export const AdditionalOptions = () => {
  return <div className="row">
    <div className="col">
      <div className="row m-2 align-items-center">
        <h4>Additional Options</h4>
      </div>
      <div className="row m-2">
        <div className="col">
          <RemoveListButton/>
          <ClearListButton/>
        </div>
      </div>
    </div>
  </div>;
};
