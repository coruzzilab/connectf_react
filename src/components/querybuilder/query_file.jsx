/**
 * @author zacharyjuang
 * 2019-02-15
 */
import {FilterTfInfo, NetworkInfo, TargetGeneInfo, UploadFile} from "./common";
import _ from "lodash";
import PropTypes from "prop-types";
import React, {useState} from "react";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import classNames from 'classnames';
import instance, {BASE_URL} from "../../utils/axios_instance";
import {ExportModal} from "../common";

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

const ListSelection = ({list, tempLists, value, onChange, name, fileName}) => {
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
      <option value="other">Upload {fileName}</option>
      <option value="input">Input {fileName}</option>
    </optgroup>
  </select>;
};

ListSelection.propTypes = {
  name: PropTypes.string.isRequired,
  list: PropTypes.array,
  tempLists: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
  fileName: PropTypes.string
};

const ListSelectionDownload = ({list, tempLists, value, onChange, name, inputValue, clickFill, fileName}) => {
  let list_download;
  let tempList;
  if (tempLists && (tempList = tempLists[value])) {
    list_download = `data:text/plain,${encodeURI(tempList)}`;
  } else if (value === 'input') {
    list_download = `data:text/plain,${encodeURI(inputValue)}`;
  } else {
    list_download = `${BASE_URL}/api/list_download/${value}/`;
  }

  let disabledAutofill = !(value && _.indexOf(['input', 'other'], value) === -1);

  return <div className="row">
    <div className="col-10 pr-1">
      <ListSelection name={name} list={list} tempLists={tempLists} onChange={onChange} value={value}
                     fileName={fileName}/>
    </div>
    <div className="col-1 px-1">
      <button type="button"
              className={classNames("btn btn-primary btn-block text-nowrap", {disabled: disabledAutofill})}
              onClick={clickFill.bind(undefined, list_download)}
              disabled={disabledAutofill}>
        <Icon icon="edit" className="mr-1"/>Autofill
      </button>
    </div>
    <div className="col-1 pl-1">
      <a className={classNames("btn btn-primary btn-block text-nowrap", {disabled: (!value || value === 'other')})}
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
  inputValue: PropTypes.string,
  clickFill: PropTypes.func,
  fileName: PropTypes.string
};

const ListInput = ({value, onChange, inputRef, save}) => {
  let [isOpen, setIsOpen] = useState(false);

  return <div className="row">
    <div className="col">
      <div className="row">
        <div className="col">
                <textarea className="form-control my-2" rows={5} ref={inputRef} value={value}
                          onChange={onChange}/>
        </div>
      </div>

      {save ?
        <div className="row">
          <div className="col">
            <button type="button" className="btn btn-primary"
                    disabled={!value}
                    onClick={setIsOpen.bind(undefined, !isOpen)}>
              <Icon icon="save" className="mr-1"/>Save
            </button>
            <ExportModal isOpen={isOpen} toggle={setIsOpen.bind(undefined, !isOpen)} genes={value}
                         addHeader={false}/>
          </div>
        </div> :
        null}
    </div>
  </div>;
};

ListInput.propTypes = {
  save: PropTypes.bool,
  value: PropTypes.string,
  onChange: PropTypes.func,
  inputRef: PropTypes.object
};

ListInput.defaultProps = {
  save: true
};

const clickFill = (onChange, setInputValue) => {
  return (dataUri) => {
    instance.get(dataUri, {baseURL: ''}).then(({data}) => {
      onChange('input');
      setInputValue(data);
    });
  };
};

const ListForm = ({value, list, tempLists, onChange, fileRef, inputRef, name, fileName, save}) => {
  let [inputValue, setInputValue] = useState("");

  return <div className="form-row m-2">
    <div className="col">
      <ListSelectionDownload name={name}
                             list={list}
                             tempLists={tempLists}
                             onChange={onChange}
                             value={value}
                             inputValue={inputValue}
                             clickFill={clickFill(onChange, setInputValue)}
                             fileName={fileName}/>

      {value === "other" ?
        <div className="row">
          <div className="col">
            <UploadFile inputRef={fileRef} name={`${name}_file`} className="my-2" save={save}/>
          </div>
        </div> :
        null}

      {value === "input" ?
        <ListInput inputRef={inputRef}
                   value={inputValue}
                   onChange={(e) => {
                     setInputValue(e.target.value);
                   }}
                   save={save}/> :
        null}
    </div>
  </div>;
};

ListForm.propTypes = {
  name: PropTypes.string,
  list: PropTypes.array,
  tempLists: PropTypes.object,
  value: PropTypes.string,
  fileRef: PropTypes.object.isRequired,
  inputRef: PropTypes.object.isRequired,
  onChange: PropTypes.func,
  fileName: PropTypes.string,
  save: PropTypes.bool
};

ListForm.defaultProps = {
  save: true
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
      <ListForm name="targetgene"
                fileName="Target Genes"
                list={list}
                tempLists={tempLists}
                onChange={onChange}
                inputRef={inputRef}
                fileRef={fileRef}
                value={value}/>
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
      <ListForm name="filtertf"
                fileName="Filter TFs"
                list={list}
                tempLists={tempLists}
                onChange={onChange}
                inputRef={inputRef}
                fileRef={fileRef}
                value={value}/>
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
      <ListForm name="network"
                fileName="Network"
                list={list}
                onChange={onChange}
                inputRef={inputRef}
                fileRef={fileRef}
                value={value}
                save={false}/>
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
