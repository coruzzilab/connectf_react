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
const NavItemBody = ({to, location, children}) => (<BSNavItem active={location.pathname === to}>
  <Link to={to} className="nav-link">{children}</Link>
</BSNavItem>);

NavItemBody.propTypes = {
  to: PropTypes.string,
  location: PropTypes.object,
  children: PropTypes.node
};

export const NavItem = withRouter(NavItemBody);

NavItem.propTypes = {
  to: PropTypes.string.isRequired
};
