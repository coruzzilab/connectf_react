/**
 * @author zacharyjuang
 * 8/27/18
 */
import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';
import classNames from 'classnames';


const Button = ({children, danger}) => (
  <span className={classNames("d-inline-block btn btn-sm", danger ? "btn-danger" : "btn-success")}>
    {children}
    </span>);

Button.propTypes = {
  children: PropTypes.node,
  danger: PropTypes.bool
};


class Tutorial extends React.Component {
  render() {
    return <div className="container">
      <div className="row">
        <h1>Making A Query</h1>
      </div>
      <div className="row">
        <h2>Build Query</h2>
      </div>
      <div className="row mb-3">
        <div className="col">
          <img src={require('../images/query.png')} alt="Query Page"
               className="img-fluid shadow rounded mx-auto d-block"
               style={{maxHeight: '400px'}}/>
        </div>
      </div>
      <div className="row">
        <div className="col">
          <p>
            Click on <Button><Icon icon="plus-circle" className="mr-1"/>Add TF</Button> to add transcription factors
            to the query. Use <Button><Icon icon="plus-circle" className="mr-1"/>Add TF Group</Button> along with drag
            and drop to arrange transcription factors into groups. Selecting
            <span className="font-weight-bold"> and</span> or <span className="font-weight-bold"> or</span> will query
            either the intersection or union of the group. Special
            <span className="font-weight-bold"> andalltfs</span> or
            <span className="font-weight-bold"> oralltfs</span> keyword is used to query the intersection or union of
            all the transcription factors in the database. A <span className="font-weight-bold">not</span> selection is
            also provided to filter data that is not targeted by the transcription factor. Usually used in conjunction
            with an <span className="font-weight-bold"> and</span> operator to query for data that is targeted by one
            transcription factor, but not the other.
          </p>
        </div>
      </div>
      <div className="row">
        <h2>Select Additional Edges</h2>
      </div>
      <div className="row">
        <div className="col">
          <p>In the <span className="font-weight-bold">Additional Edges</span> section, select additional edge
            properties that you would like to be displayed in the results. (<span className="font-italic">e.g.</span>
            whether each edge is validated by DAP, etc.)
          </p>
        </div>
      </div>
      <div className="row">
        <h2>Select A Target Gene List</h2>
      </div>
      <div className="row">
        <div className="col">
          <p>
            The <span className="font-weight-bold">Target Genes</span> allows users to either select a predefined gene
            list or upload their own to filter the results. This will result in a smaller subset of the output
            consisting only of genes that are defined in the gene list, effectively narrowing the output to only
            genes of interest.
          </p>
          <p>
            This will also affect statistics that are calculated on the result.
          </p>
        </div>
      </div>
      <div className="row">
        <h1>Understanding The Results</h1>
      </div>
    </div>;
  }
}

export default Tutorial;
