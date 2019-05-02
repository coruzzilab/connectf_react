/**
 * @author zacharyjuang
 * 2019-04-25
 */
import React from "react";
import uuid4 from "uuid/v4";
import Clipboard from "clipboard";
import {
  Button,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  UncontrolledButtonDropdown
} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import {addList} from "../../../actions";
import _ from "lodash";

function mapStateToProps({result}) {
  return {
    result
  };
}

class ExportClipboard extends React.Component {
  constructor(props) {
    super(props);

    this.uid = uuid4();

    this.state = {
      copy: false
    };
  }

  componentDidMount() {
    let {content} = this.props;

    this.clipboard = new Clipboard(document.getElementById(this.uid), {
      text: function () {
        return content;
      }
    });

    this.clipboard.on('success', () => {
      this.setState({copy: true});

      setTimeout(() => {
        this.setState({copy: false});
      }, 1000);
    });
  }

  componentWillUnmount() {
    this.clipboard.destroy();
  }

  render() {
    return Clipboard.isSupported() ?
      <DropdownItem id={this.uid}>
        <FontAwesomeIcon icon="clipboard" className="mr-1"/>Copy To Clipboard
      </DropdownItem> :
      null;
  }
}

ExportClipboard.propTypes = {
  content: PropTypes.string.isRequired
};

export class ExportBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false,
      name: '',
      error: ''
    };

    this.nameInput = React.createRef();
  }

  toggle() {
    this.setState((prevState) => {
      if (prevState.modal) {
        return {
          modal: false,
          name: '',
          error: ''
        };
      }

      return {
        modal: true
      };
    });
  }

  handleName(e) {
    this.setState({
      name: e.target.value
    });
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

  targetGenes() {
    let {result} = this.props;

    let data = _.get(result, 'result.data', []).slice(6);
    return _(data).map(7).join("\n") + "\n";
  }

  static targetGenesBlob(geneString) {
    return URL.createObjectURL(new Blob([geneString], {type: 'text/plain'}));
  }

  focusNameInput() {
    if (this.nameInput.current) {
      this.nameInput.current.focus();
    }
  }

  render() {
    let {error} = this.state;
    let genes = this.targetGenes();

    return <div className={this.props.className}>
      <UncontrolledButtonDropdown>
        <a className="btn btn-primary" href={this.constructor.targetGenesBlob(genes)} download="target_genes.txt">
          <FontAwesomeIcon icon="file-export" className="mr-1"/>Export Target Genes
        </a>
        <DropdownToggle caret color="primary"/>
        <DropdownMenu>
          <DropdownItem onClick={this.toggle.bind(this)}>
            <FontAwesomeIcon icon="save" className="mr-1"/>Save As Temporary List
          </DropdownItem>
          <ExportClipboard content={genes}/>
        </DropdownMenu>
      </UncontrolledButtonDropdown>

      <Modal isOpen={this.state.modal} toggle={this.toggle.bind(this)} onOpened={this.focusNameInput.bind(this)}>
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
      </Modal>
    </div>;
  }
}

ExportBody.propTypes = {
  result: PropTypes.object,
  className: PropTypes.string,
  addList: PropTypes.func
};

export const Export = connect(mapStateToProps, {addList})(ExportBody);
