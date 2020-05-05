import React, {useEffect, useState} from "react";
import {getQuery} from "../../utils";
import {Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import classNames from "classnames";
import _ from "lodash";
import PropTypes from "prop-types";
import {connect} from "react-redux";

function getContent(uploadFile) {
  if (!_.isNull(uploadFile.content)) {
    let text = uploadFile.content.slice(0, 100);
    return text.length < 100 ? text : text + '...';
  }

  return uploadFile.name;
}

const WarningModalBody = ({queryTree, query, uploadFiles, edges, isOpen, toggle, submit}) => {
  let [warnBuild, setWarnBuild] = useState(false);

  useEffect(() => {
    let builtQuery = getQuery(queryTree);
    setWarnBuild(query && builtQuery && query !== builtQuery);
  }, [query, queryTree]);

  return <Modal isOpen={isOpen} toggle={toggle} backdrop={false}>
    <ModalHeader toggle={toggle}>Submit</ModalHeader>
    <ModalBody>
      <div>
        <h6>Query</h6>
        <div className={classNames(warnBuild ? "text-warning" : null)}>{query}</div>
        <div className="mb-2">
          {warnBuild ?
            <div><small>Current query is different from the one in Query Builder. Click on
              <span className="text-nowrap">&quot;Build Query&quot;</span> if necessary</small>
            </div> :
            null}
        </div>
        <h6>Additional Edge Features</h6>
        <div className="mb-2">{edges.length ?
          <ul>{_.map(edges, (e, i) => <li key={i}>{e}</li>)}</ul> :
          "No Additional Edge Features Selected"}
        </div>
        <h6>Target Genes</h6>
        <div className="mb-2">{uploadFiles['targetgenes'] ?
          getContent(uploadFiles['targetgenes']) :
          "No Target Genes Selected"}</div>
        <h6>Filter TFs</h6>
        <div className="mb-2">{uploadFiles['filtertfs'] ?
          getContent(uploadFiles['filtertfs']) :
          "No Filter TFs Selected"}</div>
        <h6>Target Networks</h6>
        <div className="mb-2">{uploadFiles['targetnetworks'] ?
          getContent(uploadFiles['targetnetworks']) :
          "No Target Networks Selected"}</div>
        <h6>Background Genes</h6>
        <div className="mb-2">{uploadFiles['backgroundgenes'] ?
          getContent(uploadFiles['backgroundgenes']) :
          "No Target Networks Selected"}</div>
      </div>
    </ModalBody>
    <ModalFooter>
      <button className="btn btn-danger" type="button" onClick={toggle}>Cancel
      </button>
      <button className="btn btn-primary" type="button" onClick={submit}>Submit
      </button>
    </ModalFooter>
  </Modal>;
};

WarningModalBody.propTypes = {
  query: PropTypes.string,
  queryTree: PropTypes.arrayOf(PropTypes.object),
  edges: PropTypes.arrayOf(PropTypes.string),
  uploadFiles: PropTypes.object,
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired
};

const WarningModal = connect(
  ({queryTree, query, edges, uploadFiles}) => ({queryTree, query, edges, uploadFiles}),
  null
)(WarningModalBody);

WarningModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  submit: PropTypes.func.isRequired
};

export default WarningModal;
