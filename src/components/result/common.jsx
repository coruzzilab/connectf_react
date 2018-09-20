import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import {NavLink as BSNavLink, Popover, PopoverBody, TabPane, Tooltip, UncontrolledTooltip} from "reactstrap";
import {Route, withRouter} from "react-router-dom";
import connect from "react-redux/es/connect/connect";
import _ from "lodash";
import {CopyButton} from "../common";

export const SortButton = ({sortFunc, sorted, ascending, ...props}) => {
  return <a onClick={sortFunc} {...props}>
    {sorted ?
      (ascending ? <FontAwesomeIcon icon="sort-up"/> : <FontAwesomeIcon icon="sort-down"/>) :
      <FontAwesomeIcon icon="sort"/>}</a>;
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
    return <Popover className="mw-100" {..._.omit(this.props, ['query', 'dispatch', 'edges'])}>
      <PopoverBody>
        <h6>Query</h6>
        <div className="d-flex mb-1 align-items-center">
          <div className="query-popover text-monospace border rounded border-light bg-light mr-1">
            {query}
          </div>
          <div>
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
