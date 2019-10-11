import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import {
  Button,
  Fade,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NavLink as BSNavLink,
  Popover,
  PopoverBody,
  TabPane,
  Tooltip,
  UncontrolledAlert,
  UncontrolledTooltip
} from "reactstrap";
import {Route, withRouter} from "react-router-dom";
import styled from "styled-components";
import _ from "lodash";
import {CopyButton} from "../common";
import {addExtraField, addList, removeExtraField, removeExtraFields} from "../../actions";
import {connect} from "react-redux";

const Sort = styled.a`
  cursor: pointer;
`;

export const SortButton = ({sortFunc, sorted, ascending, ...props}) => {
  return <Sort onClick={sortFunc} {...props}>
    {sorted ?
      (ascending ? <FontAwesomeIcon icon="sort-up"/> : <FontAwesomeIcon icon="sort-down"/>) :
      <FontAwesomeIcon icon="sort"/>}</Sort>;
};

SortButton.propTypes = {
  sortFunc: PropTypes.func.isRequired,
  sorted: PropTypes.bool.isRequired,
  ascending: PropTypes.bool.isRequired
};

export class InfoTootip extends React.Component {
  constructor(props) {
    super(props);
    this.target = React.createRef();
  }

  render() {
    return <this.props.tag className={this.props.className}>
      <div className="d-inline-block" ref={this.target}>{this.props.text ||
      <span className="link info-link"><FontAwesomeIcon icon="question-circle"/></span>}</div>
      <UncontrolledTooltip target={() => this.target.current} placement="auto">
        {this.props.children}
      </UncontrolledTooltip>
    </this.props.tag>;
  }
}

InfoTootip.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  tag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  text: PropTypes.node
};

InfoTootip.defaultProps = {
  tag: 'div'
};

export class QueryNameCell extends React.Component {
  constructor(props) {
    super(props);
    this.name = React.createRef();
    this.state = {
      tooltipOpen: false
    };
  }

  toggleTooltip() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen && (this.name.current.offsetWidth < this.name.current.scrollWidth)
    });
  }

  render() {
    return <td className="p-0 align-middle">
      <div className="query-name h-100" ref={this.name}>
        {this.props.children}
      </div>
      <Tooltip target={() => this.name.current} placement="right" isOpen={this.state.tooltipOpen} autohide={false}
               toggle={this.toggleTooltip.bind(this)}>{this.props.children}</Tooltip>
    </td>;
  }
}

QueryNameCell.propTypes = {
  children: PropTypes.node
};

export const SVGWarningTooltip = ({children, className}) => <InfoTootip className={className} text={children}>
  Open the SVG image with a browser to view the complete image. The table in the image might not render correctly
  in image editing software.
</InfoTootip>;

SVGWarningTooltip.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};

class NavLinkBody extends React.Component {
  handleClick() {
    this.props.history.push(this.props.to);
  }

  render() {
    return <BSNavLink active={this.props.location.pathname === this.props.to}
                      onClick={this.handleClick.bind(this)}>
      {this.props.children}
    </BSNavLink>;
  }
}

NavLinkBody.propTypes = {
  children: PropTypes.node,
  location: PropTypes.object,
  history: PropTypes.object,
  to: PropTypes.string
};
export const NavLink = withRouter(NavLinkBody);

NavLink.propTypes = {
  to: PropTypes.string.isRequired
};

export const RouteTabPane = ({path, tabId, children}) => (<Route path={path} render={() => {
  return <TabPane tabId={tabId}>
    {children}
  </TabPane>;
}}/>);

RouteTabPane.propTypes = {
  path: PropTypes.string.isRequired,
  tabId: PropTypes.string.isRequired,
  children: PropTypes.node
};

class QueryPopoverBody extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    let {edges, query} = this.props;
    return <Popover className="mw-100" {..._.omit(this.props, ['query', 'dispatch', 'edges'])} trigger="legacy">
      <PopoverBody>
        <h6>Query</h6>

        <div className="input-group">
          <div className="input-group-prepend">
            <span className="input-group-text text-monospace border-right-0">{query}</span>
          </div>
          <div className="input-group-append">
            <CopyButton text={query} className="btn-sm"/>
          </div>
        </div>

        {edges.length ?
          <div>
            <h6>Additional Edges</h6>
            <ul>
              {_.map(edges, (e, i) => {
                return <li key={i}>{e}</li>;
              })}
            </ul>
          </div> :
          null}
      </PopoverBody>
    </Popover>;
  }
}

QueryPopoverBody.propTypes = {
  query: PropTypes.string,
  edges: PropTypes.arrayOf(PropTypes.string)
};

export const QueryPopover = connect(({query, edges}) => ({query, edges}))(QueryPopoverBody);

class ExtraFieldsBody extends React.PureComponent {
  handleChecked(f, e) {
    if (e.target.checked) {
      this.props.addExtraField(f);
    } else {
      this.props.removeExtraField(f);
    }
  }

  render() {
    let {extraFieldNames, extraFields, removeExtraField, removeExtraFields, className} = this.props;

    return <div className={className}>
      <div className="row">
        <div className="col">
          <h3>Extra Fields</h3>
          <small>Extra fields to display on the legend table.</small>
        </div>
      </div>
      <div className="row">
        <div className="col">
          {_(extraFields).intersection(extraFieldNames).map((f, i) => {
            return <button key={i} className="btn btn-sm btn-secondary m-1 d-inline-block"
                           onClick={removeExtraField.bind(undefined, f)}>
              <FontAwesomeIcon icon="times-circle" className="mr-1"/>{f}
            </button>;
          }).value()}
          <button className="btn btn-sm btn-danger m-1 d-inline-block"
                  onClick={removeExtraFields.bind(undefined, _.intersection(extraFieldNames, extraFields))}>
            <FontAwesomeIcon icon="times-circle" className="mr-1"/>Clear All
          </button>
        </div>
      </div>
      <div className="row">
        <div className="col">
          {extraFieldNames.map((f, i) => {
            return <div className="form-check form-check-inline" key={i}>
              <label className="form-check-label">
                <input className="form-check-input" type="checkbox" value={f}
                       checked={extraFields.indexOf(f) !== -1}
                       onChange={this.handleChecked.bind(this, f)}/>
                {f}
              </label>
            </div>;
          })}
        </div>
      </div>
    </div>;
  }
}

ExtraFieldsBody.propTypes = {
  extraFieldNames: PropTypes.arrayOf(PropTypes.string),
  extraFields: PropTypes.arrayOf(PropTypes.string),
  addExtraField: PropTypes.func,
  removeExtraField: PropTypes.func,
  removeExtraFields: PropTypes.func,
  className: PropTypes.string
};

export const ExtraFields = connect(({extraFields}) => ({extraFields}), {
  addExtraField,
  removeExtraField,
  removeExtraFields
})(ExtraFieldsBody);

ExtraFields.propTypes = {
  extraFieldNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  className: PropTypes.string
};

const QueryAlertBody = ({result: {errors}, className, onExited}) => {
  // dug into UncontrolledAlert for proper configuration off transition prop
  return errors ?
    <UncontrolledAlert color="warning" className={className}
                       transition={{...Fade.defaultProps, unmountOnExit: true, onExited}}>
      <h4 className="alert-heading">Query Warning</h4>
      {_.map(errors, (err, i) => <p key={i}>{err}</p>)}
    </UncontrolledAlert> :
    null;
};

QueryAlertBody.propTypes = {
  result: PropTypes.object,
  className: PropTypes.string,
  onExited: PropTypes.func
};

export const QueryAlert = connect(({result}) => ({result}))(QueryAlertBody);

QueryAlert.propTypes = {
  className: PropTypes.string,
  onExited: PropTypes.func
};

class ExportModalBody extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      name: '',
      error: ''
    };

    this.nameInput = React.createRef();
  }

  handleName(e) {
    this.setState({
      name: e.target.value
    });
  }

  focusNameInput() {
    if (this.nameInput.current) {
      this.nameInput.current.focus();
    }
  }

  addList(genes, e) {
    let {name} = this.state;
    e.preventDefault();
    if (!name || name === 'other' || name === 'input') {
      this.setState({
        error: 'Please pick another name.'
      });
    } else {
      this.props.addList(name, `>${name}\n` + genes);
      this.toggle();
    }

  }

  toggle() {
    if (this.props.isOpen) {
      this.setState({
        name: '',
        error: ''
      });
    }
    this.props.toggle();
  }

  render() {
    let {error} = this.state;
    let {genes, isOpen} = this.props;

    return <Modal isOpen={isOpen} toggle={this.toggle.bind(this)} onOpened={this.focusNameInput.bind(this)}>
      <form onSubmit={this.addList.bind(this, genes)}>
        <ModalHeader toggle={this.toggle.bind(this)}>Name Target Gene List</ModalHeader>
        <ModalBody>
          <div className="form-group form-inline">
            <label className="mr-2">Name:</label>
            <input type="text" className="form-control mr-2" placeholder="Enter Name"
                   ref={this.nameInput}
                   onChange={this.handleName.bind(this)}
                   value={this.state.name}/>

          </div>
          <div className="form-group">
            {error ?
              <small className="form-text text-danger">{error}</small> :
              <small className="form-text text-muted">
                Name to be use in the dropdown.
              </small>}
          </div>
        </ModalBody>
        <ModalFooter>
          <button type="submit" className="btn btn-primary">Add</button>
          <Button color="secondary" onClick={this.toggle.bind(this)}>Cancel</Button>
        </ModalFooter>
      </form>
    </Modal>;
  }
}

ExportModalBody.propTypes = {
  addList: PropTypes.func,
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  genes: PropTypes.string
};

export const ExportModal = connect(null, {addList})(ExportModalBody);

ExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  genes: PropTypes.string.isRequired
};
