/**
 * @author zacharyjuang
 * 8/25/18
 */
import React from "react";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Popover,
  PopoverBody,
  PopoverHeader,
  UncontrolledDropdown
} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import classNames from "classnames";
import _ from "lodash";

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

export class AddFollowing extends React.Component {
  render() {
    return <UncontrolledDropdown>
      <DropdownToggle className="btn btn-light"><FontAwesomeIcon icon="plus-circle"/></DropdownToggle>
      <DropdownMenu right>
        <DropdownItem onClick={this.props.addNode}>
          <FontAwesomeIcon icon="plus-circle" className="mr-1"/>{this.props.addNodeText}
        </DropdownItem>
        <DropdownItem onClick={this.props.addGroup}>
          <FontAwesomeIcon icon="plus-circle" className="mr-1"/>{this.props.addGroupText}
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>;
  }
}

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

export class UploadFile extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    console.log(window.selenium);
    if (!window.selenium) {
      this.props.inputRef.current.scrollIntoView();
      this.props.inputRef.current.focus();
      this.props.inputRef.current.click();
    }
  }

  render() {
    let {className, ...props} = this.props;

    return <input type="file" className={classNames("form-control-file", className)}
                  ref={this.props.inputRef} {...props}/>;
  }
}

UploadFile.propTypes = {
  inputRef: PropTypes.object,
  className: PropTypes.string
};

const TARGET_GENES_FILE = ">list 1 name\nAT1G00100\nAT1G00200\n...\n>list 2 name (optional)\nAT2G00100\nAT2G00200\n...\n";

export class TargetGeneInfo extends React.Component {
  constructor(props) {
    super(props);
    this.info = React.createRef();

    this.state = {
      popoverOpen: false
    };
  }

  toggle() {
    this.setState({
      popoverOpen: !this.state.popoverOpen
    });
  }

  render() {
    return <div className="ml-2 ">
      <div className="link info-link" ref={this.info} onClick={this.toggle.bind(this)}>
        <FontAwesomeIcon icon="question-circle"/></div>
      <Popover target={() => this.info.current} isOpen={this.state.popoverOpen} toggle={this.toggle.bind(this)}>
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
            <FontAwesomeIcon icon="file-download" className="mr-1"/>Download Example
          </a>
        </PopoverBody>
      </Popover>
    </div>;
  }
}

export const AddTFButton = ({onClick, large}) => (
  <button type="button"
          title="Add Transcription Factor"
          className={classNames("btn btn-success", large ? "btn-lg" : null)}
          onClick={onClick}>
    <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add TF
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
    <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add TF Group
  </button>);

AddTFGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  large: PropTypes.bool
};

export const AddModButton = ({onClick}) => (
  <button type="button" className="btn btn-success"
          onClick={onClick}>
    <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Filter
  </button>);

AddModButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export const AddModGroupButton = ({onClick}) => (
  <button type="button" className="btn btn-success"
          onClick={onClick}>
    <FontAwesomeIcon icon="plus-circle" className="mr-1"/>Add Filter Group
  </button>);

AddModGroupButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export const DuplicateButton = ({onClick}) => (
  <button type="button" className="btn btn-light"
          onClick={onClick}
          title="Duplicate Item">
    <FontAwesomeIcon icon="clone"/>
  </button>);

DuplicateButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export const RemoveButton = ({onClick}) => (
  <button type="button" className="btn btn-danger" title="Remove"
          onClick={onClick}>
    <FontAwesomeIcon icon="minus-circle"/>
  </button>);

RemoveButton.propTypes = {
  onClick: PropTypes.func.isRequired
};

export const Edges = ({edgeList, edges, onChange}) => ([
  <div key={0} className="row m-2">
    <h4>Additional Edges</h4>
  </div>,
  <div key={1} className="form-row m-2">
    <div className="col-auto">
      {_.map(edgeList, (e, i) => {
        return <div className="form-check" key={i}>
          <input className="form-check-input" type="checkbox" value={e}
                 checked={_.indexOf(edges, e) !== -1}
                 onChange={onChange.bind(undefined, e)}/>
          <label className="form-check-label">{e}</label>
        </div>;
      })}
    </div>
  </div>
]);

Edges.propTypes = {
  edgeList: PropTypes.array.isRequired,
  edges: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

export const Copied = ({copied}) => (
  <span><FontAwesomeIcon icon="copy" className="mr-1"/>{copied ? "Copied!" : "Copy"}</span>);

Copied.propTypes = {
  copied: PropTypes.bool
};

Copied.defaultProps = {
  copied: false
};
