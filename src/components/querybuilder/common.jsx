/**
 * @author zacharyjuang
 * 8/25/18
 */
import React from "react";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import classNames from "classnames";

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

export class TargetGenesFile extends React.Component {
  constructor(props) {
    super(props);
    this.targetGenes = React.createRef();
  }

  componentDidMount() {
    this.targetGenes.current.scrollIntoView();
  }

  handleChange(e) {
    this.props.handleChange(e.target.files);
  }

  render() {
    return <input type="file" className="form-control-file"
                  onChange={this.handleChange.bind(this)}
                  ref={this.targetGenes}/>;
  }
}

TargetGenesFile.propTypes = {
  handleChange: PropTypes.func
};
