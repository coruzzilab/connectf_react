/**
 * Created by zacharyjuang on 11/24/16.
 */
import React from "react";
import {connect} from "react-redux";
import _ from "lodash";
import PropTypes from "prop-types";

import {postQuery, resetTree} from "../../actions";

import TF from "./tf";
import Edge from "./edge";
import Meta from "./meta";

const mapStateToProps = (state) => {
  return {
    busy: state.busy,
    error: state.error,
    tfQuery: state.tfQuery,
    edgeQuery: state.edgeQuery,
    metaQuery: state.metaQuery,
    tfTree: state.tfTree,
    edgeTree: state.edgeTree,
    metaTree: state.metaTree
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    submit: (data) => {
      dispatch(postQuery(data));
    },
    reset: () => {
      dispatch(resetTree("TF"));
      dispatch(resetTree("EDGE"));
      dispatch(resetTree("META"));
    }
  };
};

/**
 * Builds queries for tgdbbackend
 */
class QuerybuilderBody extends React.Component {
  handleSubmit() {
    let {submit} = this.props;
    let formData = this.buildForm();

    submit(formData);
  }

  reset() {
    this.props.reset();
    this.targetGenes.value = null;
  }

  buildForm() {
    let {tfQuery, edgeQuery, metaQuery, tfTree, edgeTree, metaTree} = this.props;
    let {targetGenes} = this;
    let formData = new FormData();
    let i = 0;
    let findFile = (node) => {
      if (_.isObject(node.value)) {
        formData.append(`file-${i++}`, node.value.file);
      }
    };

    formData.append('tfs', tfQuery);
    formData.append('edges', edgeQuery);
    formData.append('metas', metaQuery);
    _.forEach(tfTree, findFile);
    _.forEach(edgeTree, findFile);
    _.forEach(metaTree, findFile);

    formData.append('targetgenes', !_.isEmpty(targetGenes.files) ? _.head(targetGenes.files) : 'undefined');

    return formData;
  }

  render() {
    return <div style={{display: "flex", flexDirection: "row"}}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        flex: 90
      }}>
        <TF/>
        <Edge/>
        <Meta/>

        <div>
          <h2>TargetGenes</h2>
          <input type="file" className="form-control"
                 ref={(c) => {
                   this.targetGenes = c;
                 }}
                 style={{marginBottom: '2em'}}/>
        </div>
      </div>

      <div style={{flex: 20}}>
        <button type="button" className="btn btn-danger" onClick={this.reset.bind(this)}>Reset</button>
        <button type="button" className="btn btn-default" onClick={this.handleSubmit.bind(this)}>Submit</button>
      </div>
    </div>;
  }
}

/**
 * @memberOf QuerybuilderBody
 * @type {{busy: *, submit: (*)}}
 */
QuerybuilderBody.propTypes = {
  busy: PropTypes.bool,
  submit: PropTypes.func.isRequired,
  reset: PropTypes.func,
  tfQuery: PropTypes.string,
  edgeQuery: PropTypes.string,
  metaQuery: PropTypes.string,
  tfTree: PropTypes.array,
  edgeTree: PropTypes.array,
  metaTree: PropTypes.array
};

const Querybuilder = connect(mapStateToProps, mapDispatchToProps)(QuerybuilderBody);

export default Querybuilder;
