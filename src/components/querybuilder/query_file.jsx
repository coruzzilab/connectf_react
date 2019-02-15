/**
 * @author zacharyjuang
 * 2019-02-15
 */
import {FilterTfInfo, NetworkInfo, TargetGeneInfo, UploadFile} from "./common";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";

export const TargetGeneFile = ({value, list, onChange, inputRef}) => {
  return <div className="row">
    <div className="col">
      <div className="row m-2 align-items-center">
        <h4>Target Genes</h4>
        <TargetGeneInfo/>
      </div>
      <div className="form-row m-2">
        <p className="text-secondary">
          By default, all targets of each transcription factor is displayed. Select a
          Target Gene List (or upload your own) to filter the results.
        </p>
      </div>
      <div className="form-row m-2">
        <select className="form-control" value={value} name="targetgene"
                onChange={onChange}>
          <option value="">----</option>
          {_.map(list, (l, i) => {
            return <option key={i} value={l}>{l}</option>;
          })}
          <option disabled>──────────</option>
          <option value="other">Upload Target Genes</option>
        </select>
      </div>
      {value === "other" ?
        <div className="form-row m-2">
          <UploadFile inputRef={inputRef}/>
        </div> :
        null}
    </div>
  </div>;
};

TargetGeneFile.propTypes = {
  value: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  inputRef: PropTypes.object.isRequired
};

export const FilterTfFile = ({value, list, onChange, inputRef}) => {
  return <div className="row">
    <div className="col">
      <div className="row m-2 align-items-center">
        <h4>Filter TFs</h4>
        <FilterTfInfo/>
      </div>
      <div className="row m-2">
        <p className="text-secondary">
          Provide a gene list to limit the TFs in your query. Typically used
          with &quot;oralltfs&quot; or &quot;multitype&quot; to limit the size of the output.
        </p>
      </div>
      <div className="form-row m-2">
        <select className="form-control" name="filtertf" value={value}
                onChange={onChange}>
          <option value="">----</option>
          {_.map(list, (l, i) => {
            return <option key={i} value={l}>{l}</option>;
          })}
          <option disabled>──────────</option>
          <option value="other">Upload Gene List</option>
        </select>
      </div>
      {value === "other" ?
        <div className="form-row m-2">
          <UploadFile inputRef={inputRef}/>
        </div> :
        null}
    </div>
  </div>;
};

FilterTfFile.propTypes = {
  value: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  inputRef: PropTypes.object.isRequired
};

export const TargetNetworkFile = ({value, list, onChange, inputRef}) => {
  return <div className="row">
    <div className="col">
      <div className="row m-2 align-items-center">
        <h4>Target Network</h4>
        <NetworkInfo/>
      </div>
      <div className="row m-2">
        <p className="text-secondary">
          Provide a gene network that restricts both the query TFs and the targeted genes.
        </p>
      </div>
      <div className="form-row m-2">
        <select className="form-control" name="network" value={value}
                onChange={onChange}>
          <option value="">----</option>
          {_.map(list, (l, i) => {
            return <option key={i} value={l}>{l}</option>;
          })}
          <option disabled>──────────</option>
          <option value="other">Upload Network</option>
        </select>
      </div>
      {value === "other" ?
        <div className="form-row m-2">
          <UploadFile id="targetNetwork" inputRef={inputRef}/>
        </div> :
        null}
    </div>
  </div>;
};

TargetNetworkFile.propTypes = {
  value: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  inputRef: PropTypes.object.isRequired
};
