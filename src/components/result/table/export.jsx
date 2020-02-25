/**
 * @author zacharyjuang
 * 2019-04-25
 */
import React from "react";
import { v4 as uuidv4 } from 'uuid';
import Clipboard from "clipboard";
import {DropdownItem, DropdownMenu, DropdownToggle, UncontrolledButtonDropdown, UncontrolledDropdown} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import _ from "lodash";
import {BASE_URL} from "../../../utils/axios_instance";
import {ExportModal} from "../../common";

function mapStateToProps({result, requestId}) {
  return {
    requestId,
    result
  };
}

class ExportClipboard extends React.Component {
  constructor(props) {
    super(props);

    this.uid = uuidv4();

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

export class TargetExportBody extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modal: false
    };
  }

  toggle() {
    this.setState((prevState) => {
      return {
        modal: !prevState.modal
      };
    });
  }

  targetGenes() {
    let {result} = this.props;

    let data = _.get(result, 'result.data', []).slice(6);
    return _(data).map(7).join("\n") + "\n";
  }

  static targetGenesBlob(geneString) {
    return URL.createObjectURL(new Blob([geneString], {type: 'text/plain'}));
  }

  render() {
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

      <ExportModal isOpen={this.state.modal} toggle={this.toggle.bind(this)} genes={genes}/>
    </div>;
  }
}

TargetExportBody.propTypes = {
  result: PropTypes.object,
  className: PropTypes.string
};

export const TargetExport = connect(mapStateToProps)(TargetExportBody);


class TableExportBody extends React.Component {
  render() {
    let {requestId, className} = this.props;
    return <UncontrolledDropdown className={className}>
      <DropdownToggle caret color="primary">
        <FontAwesomeIcon icon="table" className="mr-1"/>Export Table
      </DropdownToggle>
      <DropdownMenu>
        <DropdownItem href={`${BASE_URL}/api/export/${requestId}.xlsx`}>
          <FontAwesomeIcon icon="file-excel" className="mr-1"/>Microsoft Excel (*.xlsx)
        </DropdownItem>
        <DropdownItem href={`${BASE_URL}/api/export/${requestId}.csv`}>
          <FontAwesomeIcon icon="file-csv" className="mr-1"/>Comma-separated Values (*.csv)
        </DropdownItem>
      </DropdownMenu>
    </UncontrolledDropdown>;
  }
}

TableExportBody.propTypes = {
  requestId: PropTypes.string,
  className: PropTypes.string
};

export const TableExport = connect(mapStateToProps, null)(TableExportBody);
