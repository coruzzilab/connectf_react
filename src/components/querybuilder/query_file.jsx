/**
 * @author zacharyjuang
 * 2019-02-15
 */
import {FilterTfInfo, NetworkInfo, TargetGeneInfo, UploadFile} from "./common";
import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import classNames from 'classnames';
import instance, {BASE_URL} from "../../utils/axios_instance";

const TempLists = ({tempLists}) => {
  return <optgroup label="Saved Lists">
    {_(tempLists).keys()
      .sortBy(_.method('toString'))
      .map((l, i) => {
        return <option key={i} value={l}>{l}</option>;
      })
      .value()}
  </optgroup>;
};

TempLists.propTypes = {
  tempLists: PropTypes.object.isRequired
};

const ListSelection = ({list, tempLists, value, onChange, name}) => {
  return <select className="form-control" value={value} name={name}
                 onChange={onChange}>
    <option value="">----</option>
    {_.size(list) ?
      <optgroup label="Predefined Lists">
        {_.map(list, (l, i) => {
          return <option key={i} value={l}>{l}</option>;
        })}
      </optgroup> :
      null}

    {_.size(tempLists) ? <TempLists tempLists={tempLists}/> : null}

    <optgroup label="Upload">
      <option value="other">Upload Target Genes</option>
      <option value="input">Input Target Genes</option>
    </optgroup>
  </select>;
};

ListSelection.propTypes = {
  name: PropTypes.string.isRequired,
  list: PropTypes.array,
  tempLists: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func
};

const ListSelectionDownload = ({list, tempLists, value, onChange, name, clickFill}) => {
  let list_download;
  if (tempLists) {
    list_download = tempLists[value];
  }
  list_download = (list_download && `data:text/plain,${encodeURI(list_download)}`) || `${BASE_URL}/api/list_download/${value}/`;

  let disabled = !(value && _.indexOf(['input', 'other'], value) === -1);

  return <div className="form-row m-2">
    <div className="col-10">
      <ListSelection name={name} list={list} tempLists={tempLists} onChange={onChange} value={value}/>
    </div>
    <div className="col-1">
      <button type="button"
              className={classNames("btn btn-primary btn-block", {disabled})}
              onClick={clickFill.bind(undefined, list_download)}
              disabled={disabled}>
        <Icon icon="edit" className="mr-1"/>Autofill
      </button>
    </div>
    <div className="col-1">
      <a className={classNames("btn btn-primary btn-block", {disabled})}
         href={list_download}
         download>
        <Icon icon="file-download" className="mr-1"/>Download
      </a>
    </div>
  </div>;
};

ListSelectionDownload.propTypes = {
  name: PropTypes.string,
  list: PropTypes.array,
  tempLists: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
  clickFill: PropTypes.func
};

const clickFill = (onChange, inputRef) => {
  return (dataUri) => {
    instance.get(dataUri, {baseURL: ''}).then(({data}) => {
      onChange('input');
      inputRef.current.value = data;
    });
  };
};


export const TargetGeneFile = ({value, list, tempLists, onChange, fileRef, inputRef}) => {
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
      <ListSelectionDownload name="targetgene"
                             list={list}
                             tempLists={tempLists}
                             onChange={onChange}
                             value={value}
                             clickFill={clickFill(onChange, inputRef)}/>

      {value === "other" ?
        <div className="form-row m-2">
          <UploadFile inputRef={fileRef} name="targetgene_file"/>
        </div> :
        null}

      {value === "input" ?
        <div className="form-row m-2">
          <textarea className="form-control" rows={5} ref={inputRef}/>
        </div> :
        null}
    </div>
  </div>;
};

TargetGeneFile.propTypes = {
  value: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  fileRef: PropTypes.object.isRequired,
  inputRef: PropTypes.object.isRequired,
  tempLists: PropTypes.object
};

export const FilterTfFile = ({value, list, tempLists, onChange, fileRef, inputRef}) => {
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
      <ListSelectionDownload name="filtertf"
                             list={list}
                             tempLists={tempLists}
                             onChange={onChange}
                             value={value}
                             clickFill={clickFill(onChange, inputRef)}/>

      {value === "other" ?
        <div className="form-row m-2">
          <UploadFile inputRef={fileRef} name="filtertf_file"/>
        </div> :
        null}

      {value === "input" ?
        <div className="form-row m-2">
          <textarea className="form-control" rows={5} ref={inputRef}/>
        </div> :
        null}
    </div>
  </div>;
};

FilterTfFile.propTypes = {
  value: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  fileRef: PropTypes.object.isRequired,
  inputRef: PropTypes.object.isRequired,
  tempLists: PropTypes.object
};

export const TargetNetworkFile = ({value, list, onChange, fileRef, inputRef}) => {
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
      <ListSelectionDownload name="network"
                             list={list}
                             onChange={onChange}
                             value={value}
                             clickFill={clickFill(onChange, inputRef)}/>

      {value === "other" ?
        <div className="form-row m-2">
          <UploadFile id="targetNetwork" inputRef={fileRef} name="network_file"/>
        </div> :
        null}

      {value === "input" ?
        <div className="form-row m-2">
          <textarea className="form-control" rows={5} ref={inputRef}/>
        </div> :
        null}
    </div>
  </div>;
};

TargetNetworkFile.propTypes = {
  value: PropTypes.string.isRequired,
  list: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  fileRef: PropTypes.object.isRequired,
  inputRef: PropTypes.object.isRequired
};
