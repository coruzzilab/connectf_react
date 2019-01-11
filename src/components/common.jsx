/**
 * @author zacharyjuang
 * 9/5/18
 */
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";
import React from "react";
import {NavItem as BSNavItem} from "reactstrap";
import Clipboard from "clipboard";
import classNames from "classnames";
import _ from "lodash";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

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

export class CopyButton extends React.Component {
  constructor(props) {
    super(props);

    this.copy = React.createRef();

    this.state = {
      copied: false
    };
  }

  componentDidMount() {
    this.clipboard = new Clipboard(this.copy.current, {
      text: () => {
        return this.props.text;
      }
    });

    this.clipboard.on('success', () => {
      this.setCopied(true);
      setTimeout(this.setCopied.bind(this, false), 500);
    });
  }

  componentWillUnmount() {
    this.clipboard.destroy();
  }

  setCopied(copied) {
    this.setState({copied});
  }

  render() {
    let {copied} = this.state;
    let {className, content: Tag} = this.props;

    return <button type="button"
                   className={classNames("btn", className, copied ? "btn-success" : "btn-outline-secondary")}
                   ref={this.copy}
                   title="Copy query to clipboard">
      {Tag ? <Tag copied={copied}/> : <FontAwesomeIcon icon="copy"/>}
    </button>;
  }
}

CopyButton.propTypes = {
  text: PropTypes.string.isRequired,
  className: PropTypes.string,
  content: PropTypes.func
};
