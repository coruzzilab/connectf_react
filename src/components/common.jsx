/**
 * @author zacharyjuang
 * 9/5/18
 */
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";
import React from "react";
import {NavItem as BSNavItem} from "reactstrap";

/**
 * React-router aware NavItem
 */
class NavItemBody extends React.Component {
  render() {
    return <BSNavItem active={this.props.location.pathname === this.props.to}>
      <Link to={this.props.to} className="nav-link">{this.props.children}</Link>
    </BSNavItem>;
  }
}

NavItemBody.propTypes = {
  to: PropTypes.string,
  location: PropTypes.object,
  children: PropTypes.node
};
export const NavItem = withRouter(NavItemBody);

NavItem.propTypes = {
  to: PropTypes.string.isRequired
};
