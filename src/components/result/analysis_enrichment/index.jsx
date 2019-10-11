/**
 * @author zacharyjuang
 * 9/5/18
 */
import React from "react";
import PropTypes from "prop-types";
import {connect} from "react-redux";
import _ from "lodash";
import {getAnalysisEnrichment} from "../../../actions/analysis_enrichment";
import EnrichmentGrid from "./enrichment_grid";
import EnrichmentTable from "./enrichment_table";

function mapStateToProps({requestId, analysisEnrichment: {data, error, hidden}}) {
  return {
    requestId,
    data,
    error,
    hidden
  };
}

class AnalysisEnrichmentBody extends React.PureComponent {
  constructor(props) {
    super(props);

    this.container = React.createRef();

    this.state = {
      height: 0,
      width: 0
    };

    this.setSize = _.debounce(this.setSize.bind(this), 200);
  }

  componentDidMount() {
    this.setSize();
    window.addEventListener("resize", this.setSize);

    this.props.getAnalysisEnrichment(this.props.requestId);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.setSize);
  }

  setSize() {
    if (this.container.current) {
      let {top, width} = this.container.current.getBoundingClientRect();
      this.setState({
        height: document.documentElement.clientHeight - top,
        width
      });
    }
  }

  render() {
    let {height, width} = this.state;
    let {data, error, hidden} = this.props;

    return <div className="container-fluid">
      {error ?
        <p className="text-danger">
          Analysis Enrichment unavailable. Please query more than 1 analysis to see results.
        </p> :
        <div className="row">
          <EnrichmentGrid className="col-6 p-0" ref={this.container} data={data} hidden={hidden} width={width}
                          height={height}/>
          <EnrichmentTable className="col-6"/>
        </div>
      }
    </div>;
  }
}

AnalysisEnrichmentBody.propTypes = {
  getAnalysisEnrichment: PropTypes.func,
  requestId: PropTypes.string,
  data: PropTypes.object,
  error: PropTypes.bool,
  hidden: PropTypes.arrayOf(PropTypes.number)
};

const AnalysisEnrichment = connect(mapStateToProps, {getAnalysisEnrichment})(AnalysisEnrichmentBody);

export default AnalysisEnrichment;
