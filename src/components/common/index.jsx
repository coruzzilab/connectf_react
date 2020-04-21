/**
 * @author zacharyjuang
 * 9/5/18
 */
import {Link, withRouter} from "react-router-dom";
import PropTypes from "prop-types";
import React, {useRef, useState} from "react";
import {
  Button,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NavItem as BSNavItem,
  UncontrolledPopover
} from "reactstrap";
import Clipboard from "clipboard";
import classNames from "classnames";
import {FontAwesomeIcon as Icon, FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {connect} from "react-redux";
import {addEdge, addList, getEdgeList, getNetwork, removeEdge, setEdges} from "../../actions";
import _ from "lodash";
import {checkAupr} from "../../utils/axios_instance";
import {AuprAdjuster} from "../result/network/aupr";
import {Edges} from "../querybuilder/additional_edges";

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
            <h3>Additional Edge Features</h3>
            <p>Additional edge features to display on network graph.</p>
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
            <Edges edges={edges} onChange={this.handleChecked.bind(this)} edgeList={edgeList}/>
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

export const InfoPopover = ({children}) => {
  let info = useRef(null);

  return <div className="ml-2">
    <div className="link info-link" ref={info} title="More info">
      <FontAwesomeIcon icon="question-circle"/></div>
    <UncontrolledPopover target={info} delay={0} fade={false}>
      {children}
    </UncontrolledPopover>
  </div>;
};

InfoPopover.propTypes = {
  children: PropTypes.node
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
    e.stopPropagation();
    if (!name || name === 'other' || name === 'input') {
      this.setState({
        error: 'Please pick another name.'
      });
    } else {
      if (this.props.addHeader) {
        this.props.addList(name, `>${name}\n` + genes);
      } else {
        this.props.addList(name, genes);
      }
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
        <ModalHeader toggle={this.toggle.bind(this)}>Name Your Gene List</ModalHeader>
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
  addHeader: PropTypes.bool,
  isOpen: PropTypes.bool,
  toggle: PropTypes.func,
  genes: PropTypes.string
};

ExportModalBody.defaultProps = {
  addHeader: true
};

export const ExportModal = connect(null, {addList})(ExportModalBody);

ExportModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  genes: PropTypes.string.isRequired,
  addHeader: PropTypes.bool
};

export class ResizeComponent extends React.Component {
  constructor(props) {
    super(props);

    this.childRef = React.createRef();

    this.state = {
      height: 0,
      width: 0
    };

    this.setHeight = _.throttle(this.setHeight.bind(this), 100);
  }

  componentDidMount() {
    this.setHeight();
    window.addEventListener("resize", this.setHeight);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.setHeight);
  }

  setHeight() {
    let {top, width} = this.childRef.current.getBoundingClientRect();
    this.setState({height: document.documentElement.clientHeight - top, width});
  }

  render() {
    return <div ref={this.childRef} className={this.props.className}>
      {React.cloneElement(this.props.children, {height: this.state.height, width: this.state.width})}
    </div>;
  }
}

ResizeComponent.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export const withResize = (Tag) => {
  const Resized = (props) => <ResizeComponent>
    <Tag {...props}/>
  </ResizeComponent>;

  return Resized;
};

export const EditToggleInput = ({value, onChange, editable}) => {
  let [isEdit, setIsEdit] = useState(false);

  let toggle = (e) => {
    e.preventDefault();
    setIsEdit(!isEdit);
  };

  return isEdit && editable ?
    <span>
      <div className="input-group">
        <input type="text" className="form-control" value={value} onChange={onChange} autoFocus
               onKeyPress={(e) => {
                 if (e.key === "Enter") {
                   toggle(e);
                 }
               }}/>
        <div className="input-group-append">
          <button type="button" className="btn btn-outline-secondary" onClick={toggle}>Done</button>
        </div>
      </div>
    </span> :
    <span>
      {value}
      {editable ?
        <span className="link text-secondary ml-1" title="edit" onClick={toggle}><Icon icon="edit"/></span> :
        null}
    </span>;
};

EditToggleInput.propTypes = {
  editable: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func
};

EditToggleInput.defaultProps = {
  editable: true
};
