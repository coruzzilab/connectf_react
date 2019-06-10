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
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {connect} from "react-redux";
import {addEdge, getEdgeList, getNetwork, removeEdge, setEdges} from "../actions";
import _ from "lodash";
import {checkAupr} from "../utils/axios_instance";
import {AuprAdjuster} from "./result/network/aupr";

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

function mapStateToProps({requestId, busy, edges, edgeList, precisionCutoff}) {
  return {
    requestId,
    busy,
    edges,
    edgeList,
    precisionCutoff
  };
}

class NetworkAdditionalEdgesBody extends React.PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      hasAupr: false,
      shouldRefresh: false
    };
  }

  componentDidMount() {
    if (_.isEmpty(this.props.edgeList)) {
      this.props.getEdgeList().then(() => {
        this.props.setEdges(_.intersection(this.props.edges, this.props.edgeList));
      });
    }

    this.checkAupr();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.requestId !== this.props.requestId) {
      this.checkAupr();
    }

    if (prevProps.precisionCutoff !== this.props.precisionCutoff ||
      prevProps.edges !== this.props.edges ||
      prevProps.requestId !== this.props.requestId) {
      this.setState({shouldRefresh: true});
    }
  }

  handleChecked(f, e) {
    if (e.target.checked) {
      this.props.addEdge(f);
    } else {
      this.props.removeEdge(f);
    }
  }

  checkAupr() {
    let {hasAupr} = this.props;

    if (typeof hasAupr === 'undefined') {
      return checkAupr(this.props.requestId)
        .then(() => {
          this.setState({
            hasAupr: true
          });
        })
        .catch(() => {
          this.setState({
            hasAupr: false
          });
        });
    } else {
      this.setState({
        hasAupr
      });
    }
  }

  getNetwork() {
    this.props.getNetwork(this.props.requestId, this.props.edges, this.props.precisionCutoff)
      .then(() => {
        this.setState({shouldRefresh: false});
      });
  }

  render() {
    let {busy, edges, edgeList, setEdges, removeEdge, className} = this.props;
    let {hasAupr, shouldRefresh} = this.state;

    return <div className="row">
      <div className={classNames("col m-1", className)}>
        <div className="row">
          <div className="col">
            <h3>Additional Edges</h3>
            <p>Additional edges to display on network graph.</p>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            {edges.map((f, i) => {
              return <button key={i} className="btn btn-sm btn-secondary m-1 d-inline-block"
                             onClick={removeEdge.bind(undefined, f)}>
                <FontAwesomeIcon icon="times-circle" className="mr-1"/>{f}
              </button>;
            })}
            <button className="btn btn-sm btn-danger m-1 d-inline-block"
                    onClick={setEdges.bind(undefined, [])}>
              <FontAwesomeIcon icon="times-circle" className="mr-1"/>Clear All
            </button>
          </div>
        </div>
        <div className="row mb-2">
          <div className="col">
            {edgeList.map((f, i) => {
              return <div className="form-check form-check-inline" key={i}>
                <input className="form-check-input" type="checkbox" value={f}
                       checked={edges.indexOf(f) !== -1}
                       onChange={this.handleChecked.bind(this, f)}/>
                <label className="form-check-label">{f}</label>
              </div>;
            })}
          </div>
        </div>
        {hasAupr ?
          <div className="row mb-2">
            <div className="col">
              <div className="row">
                <div className="col">
                  <h3>AUPR Precision Cutoff</h3>
                  <p>Display validated edges above precision cutoff.</p>
                </div>
              </div>
              <AuprAdjuster/>
            </div>
          </div> :
          null
        }
        <div className="row mb-1">
          <div className="col">
            <button className={classNames("btn", shouldRefresh ? "btn-warning" : "btn-primary")}
                    onClick={this.getNetwork.bind(this)}>
              <FontAwesomeIcon icon="sync" className="mr-1" spin={Boolean(busy)}/>Update Network
            </button>
          </div>
        </div>
      </div>
    </div>;
  }
}

NetworkAdditionalEdgesBody.propTypes = {
  requestId: PropTypes.string,
  busy: PropTypes.number,
  edges: PropTypes.arrayOf(PropTypes.string),
  edgeList: PropTypes.arrayOf(PropTypes.string),
  addEdge: PropTypes.func,
  removeEdge: PropTypes.func,
  setEdges: PropTypes.func,
  getNetwork: PropTypes.func,
  getEdgeList: PropTypes.func,
  className: PropTypes.string,
  precisionCutoff: PropTypes.number,
  hasAupr: PropTypes.bool
};

export const NetworkAdditionalEdges = connect(mapStateToProps, {
  addEdge,
  removeEdge,
  setEdges,
  getNetwork,
  getEdgeList
})(NetworkAdditionalEdgesBody);

NetworkAdditionalEdges.propTypes = {
  className: PropTypes.string,
  hasAupr: PropTypes.bool
};

export class TwitterFollow extends React.Component {
  constructor(props) {
    super(props);

    this.link = React.createRef();
  }

  componentDidMount() {
    this.script = document.createElement('script');
    this.script.src = "https://platform.twitter.com/widgets.js";
    this.script.async = true;
    this.script.onload = () => {
      window.twttr.widgets.load(this.link.current);
    };

    document.head.appendChild(this.script);
  }

  componentWillUnmount() {
    document.head.removeChild(this.script);
  }

  render() {
    let {size, showCount, username, className} = this.props;

    return <a href={`https://twitter.com/${username}`} className={classNames("twitter-follow-button", className)}
              ref={this.link}
              data-size={size}
              data-dnt="true"
              data-show-count={showCount}>Follow @{username}</a>;
  }
}

TwitterFollow.propTypes = {
  username: PropTypes.string.isRequired,
  size: PropTypes.string,
  showCount: PropTypes.bool,
  className: PropTypes.string
};

TwitterFollow.defaultProps = {
  size: "large",
  showCount: true
};
