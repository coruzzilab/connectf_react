/**
 * @author zacharyjuang
 * 2019-02-15
 */
import {FilterTfInfo, NetworkInfo, TargetGeneInfo, UploadFile} from "./common";
import _ from "lodash";
import PropTypes from "prop-types";
import React, {useEffect, useRef, useState} from "react";
import {FontAwesomeIcon as Icon} from "@fortawesome/react-fontawesome";
import classNames from 'classnames';
import instance, {BASE_URL, getTargetGeneLists, getTargetNetworks} from "../../utils/axios_instance";
import {ExportModal} from "../common";
import {connect} from "react-redux";
import {addUpload, removeUpload} from "../../actions";

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

const ListSelection = ({list, tempLists, value, onChange, name, fileName, enableUpload}) => {
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

    {enableUpload ?
      <optgroup label="Upload">
        <option value="other">Upload {fileName}</option>
        <option value="input">Input {fileName}</option>
      </optgroup> :
      null}
  </select>;
};

ListSelection.propTypes = {
  name: PropTypes.string.isRequired,
  list: PropTypes.array,
  tempLists: PropTypes.object,
  value: PropTypes.string,
  onChange: PropTypes.func,
  fileName: PropTypes.string,
  enableUpload: PropTypes.bool
};

const ListSelectionDownload = ({list, tempLists, value, onChange, name, inputValue, clickFill, fileName, enableUpload}) => {
  let rowRef = useRef(null);
  let [wide, setWide] = useState(true);

  useEffect(() => {
    setWide(rowRef.current.offsetWidth > 768);
  }, []);

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

  return <div className="row" ref={rowRef}>
    <div className="col pr-1">
      <ListSelection name={name} list={list} tempLists={tempLists} onChange={onChange} value={value}
                     fileName={fileName} enableUpload={enableUpload}/>
    </div>
    {enableUpload ?
      <div className={classNames(wide ? "col-2" : "col-4")}>
        <div className="row">
          <div className="col px-1">
            <button type="button"
                    className={classNames("btn btn-primary btn-block text-nowrap", {disabled: disabledAutofill})}
                    onClick={clickFill.bind(undefined, list_download)}
                    disabled={disabledAutofill}>
              <Icon icon="edit" className="mr-1"/>Autofill
            </button>
          </div>
          <div className="col px-1">
            <a
              className={classNames("btn btn-primary btn-block text-nowrap", {disabled: (!value || value === 'other')})}
              href={list_download}
              download>
              <Icon icon="file-download" className="mr-1"/>Download
            </a>
          </div>
        </div>
      </div> :
      null}
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
  fileName: PropTypes.string,
  enableUpload: PropTypes.bool
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

const ListFormBody = ({uploadFiles, listName, list, tempLists, name, fileName, save, enableUpload, addUpload, removeUpload}) => {
  let [inputValue, setInputValue] = useState("");
  let [value, setValue] = useState("");

  useEffect(() => {
    setValue(_.get(uploadFiles, [listName, 'name'], ""));
  }, []);

  useEffect(() => {
    if (value === "input") {
      addUpload(listName, "input", inputValue);
    } else if (_.has(tempLists, value)) {
      addUpload(listName, value, tempLists[value]);
    } else if (value && value !== "other") {
      addUpload(listName, value, null);
    } else if (!value) {
      removeUpload(listName);
    }
  }, [value, inputValue]);

  let onSelect = (e) => {
    if (typeof e === 'string') {
      setValue(e);
    } else {
      setValue(e.target.value);
    }
  };

  let onFileChange = (name, result) => {
    addUpload(listName, name, result);
  };

  return <div className="form-row m-2">
    <div className="col">
      <ListSelectionDownload name={name}
                             list={list}
                             tempLists={tempLists}
                             onChange={onSelect}
                             value={value}
                             inputValue={inputValue}
                             clickFill={clickFill(onSelect, setInputValue)}
                             fileName={fileName}
                             enableUpload={enableUpload}/>

      {value === "other" ?
        <div className="row">
          <div className="col">
            <UploadFile name={`${name}_file`} className="my-2" onChange={onFileChange} save={save}/>
          </div>
        </div> :
        null}

      {value === "input" ?
        <ListInput value={inputValue}
                   onChange={(e) => {
                     setInputValue(e.target.value);
                   }}
                   save={save}/> :
        null}
    </div>
  </div>;
};

ListFormBody.propTypes = {
  listName: PropTypes.string.isRequired,
  name: PropTypes.string,
  list: PropTypes.array,
  tempLists: PropTypes.object,
  fileName: PropTypes.string,
  save: PropTypes.bool,
  enableUpload: PropTypes.bool,
  addUpload: PropTypes.func,
  removeUpload: PropTypes.func,
  uploadFiles: PropTypes.object
};

ListFormBody.defaultProps = {
  save: true,
  enableUpload: true
};

const ListForm = connect(({uploadFiles}) => ({uploadFiles}), {addUpload, removeUpload})(ListFormBody);

export const TargetGeneSelectionBody = ({tempLists, enableUpload}) => {
  let [targetGeneLists, setTargetGeneLists] = useState([]);

  useEffect(() => {
    getTargetGeneLists().then(setTargetGeneLists);
  }, []);

  return <ListForm name="targetgene"
                   fileName="Target Genes"
                   listName="targetgenes"
                   list={targetGeneLists}
                   tempLists={tempLists}
                   enableUpload={enableUpload}/>;
};

TargetGeneSelectionBody.propTypes = {
  tempLists: PropTypes.object,
  enableUpload: PropTypes.bool
};

export const TargetGeneSelection = connect(({tempLists}) => ({tempLists}), null)(TargetGeneSelectionBody);

TargetGeneSelection.propTypes = {
  enableUpload: PropTypes.bool
};

const TargetGeneFileBody = ({tempLists}) => {
  let [targetGeneLists, setTargetGeneLists] = useState([]);

  useEffect(() => {
    getTargetGeneLists().then(setTargetGeneLists);
  }, []);

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
                listName="targetgenes"
                list={targetGeneLists}
                tempLists={tempLists}/>
    </div>
  </div>;
};

TargetGeneFileBody.propTypes = {
  tempLists: PropTypes.object
};

export const TargetGeneFile = connect(({tempLists}) => ({tempLists}))(TargetGeneFileBody);

const FilterTfFileBody = ({tempLists}) => {
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
                listName="filtertfs"
                list={[]}
                tempLists={tempLists}/>
    </div>
  </div>;
};

FilterTfFileBody.propTypes = {
  tempLists: PropTypes.object
};

export const FilterTfFile = connect(({tempLists}) => ({tempLists}))(FilterTfFileBody);

export const TargetNetworkFile = () => {
  let [targetNetworks, setTargetNetworks] = useState([]);

  useEffect(() => {
    getTargetNetworks().then(setTargetNetworks);
  }, []);

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
                listName="targetnetworks"
                list={targetNetworks}
                save={false}/>
    </div>
  </div>;
};

const BackgroundGenesFileBody = ({tempLists}) => {
  return <div className="row">
    <div className="col">
      <div className="row m-2 align-items-center">
        <h4>Background Genes</h4>
        <NetworkInfo/>
      </div>
      <div className="row m-2">
        <p className="text-secondary">
          Provide a list of background genes to restrict analysis results.
        </p>
      </div>
      <ListForm name="background"
                fileName="Background"
                listName="backgroundgenes"
                list={[]}
                tempLists={tempLists}
                save={true}/>
    </div>
  </div>;
};

BackgroundGenesFileBody.propTypes = {
  tempLists: PropTypes.object
};

export const BackgroundGenesFile = connect(({tempLists}) => ({tempLists}))(BackgroundGenesFileBody);
