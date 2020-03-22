import React, {useEffect, useRef, useState} from 'react';
import _ from "lodash";
import {connect} from 'react-redux';
import PropTypes from 'prop-types';
import {getAdditionalMotifEnrichment, getAdditionalMotifs} from "../../../../utils/axios_instance";
import {ColHeader} from "../common";
import {blueShader, columnString, getLogMinMax} from "../../../../utils";
import {setBusy} from "../../../../actions";
import {SortButton} from "../../common";
import MotifPicker from "./motif_picker";
import MotifAdder from "./motif_adder";
import ExportData from "./export_data";
import {makeLines} from "../common";

const mapStateToProps = ({requestId}) => {
  return {
    requestId
  };
};

const AdditionalMotifsBody = ({requestId, motifRegions, setBusy}) => {
  let [additionalMotifs, setAdditionalMotifs] = useState([]);
  let [selectedMotifs, setSelectedMotifs] = useState([]);
  let [enrichmentData, setEnrichmentData] = useState({});
  let [sortCol, setSortCol] = useState(null);
  let [ascending, setAscending] = useState(true);
  let [tick, setTick] = useState(0);

  let [min, max] = getLogMinMax(_.get(enrichmentData, 'result', []));

  const prevSelectedMotifsRef = useRef();
  useEffect(() => {
    let prevSelectedMotifs = prevSelectedMotifsRef.current;

    prevSelectedMotifsRef.current = selectedMotifs;

    if (prevSelectedMotifs && prevSelectedMotifs.length && selectedMotifs.length) {
      setTick(tick + 1);
    }
  }, [selectedMotifs]);

  useEffect(() => {
    getAdditionalMotifs().then(({data}) => {
      setAdditionalMotifs(data['motifs']);
    });
  }, []);

  useEffect(() => {
    let data = {regions: motifRegions};
    if (selectedMotifs.length) {
      data.motifs = selectedMotifs;
    }

    setBusy(true);
    getAdditionalMotifEnrichment(requestId, data)
      .then(({data}) => {
        setEnrichmentData(data);
        if (!selectedMotifs.length) {
          setSelectedMotifs(_.map(_.get(data, 'columns'), 'motifs'));
        }
      })
      .finally(() => {
        setBusy(false);
      });
  }, [requestId, motifRegions, tick]);

  const setColumnMotifs = (i, value) => {
    setSelectedMotifs([...selectedMotifs.slice(0, i), value, ...selectedMotifs.slice(i + 1)]);
  };

  const sortFunc = (i) => {
    if (sortCol !== i) {
      setSortCol(i);
      setAscending(true);
    } else if (ascending) {
      setAscending(false);
    } else if (!ascending) {
      setSortCol(null);
      setAscending(true);
    }
  };

  return <div className="container-fluid">
    <div className="row my-1">
      <div className="col">
        <ExportData enrichmentData={enrichmentData} className="float-right"/>
      </div>
    </div>
    <div className="row">
      <div className="col table-responsive">
        <table className="table table-bordered">
          <thead>
          <tr>
            <th className="p-0">
              <MotifAdder className="m-1"
                          motifs={additionalMotifs}
                          selectedMotifs={selectedMotifs}
                          setSelectedMotifs={setSelectedMotifs}/>
            </th>
            {_.map(_.get(enrichmentData, 'columns', []), (colData, i) => {
              let [line1, line2] = makeLines(colData);

              return <ColHeader key={i} colSpan={colData.motifs.length || 1} data={colData}>
                <div className="row">
                  <div className="col">
                    <button className="btn btn-link text-nowrap">
                      <p className="m-0">{columnString(i + 1)} — {line1}</p>
                      {line2 ? <p className="m-0">{line2}</p> : null}
                    </button>
                  </div>
                  <div className="col" onClick={(e) => e.stopPropagation()}>
                    <MotifPicker value={selectedMotifs[i]} motifs={additionalMotifs}
                                 onChange={setColumnMotifs.bind(undefined, i)}/>
                  </div>
                </div>
              </ColHeader>;
            })}
          </tr>
          <tr>
            <th/>
            {_(_.get(enrichmentData, 'columns', [])).map((val) => {
              if (val.motifs.length) {
                return val.motifs;
              }
              return [null];
            }).flatten().map((m, i) => {
              if (!_.isNull(m)) {
                return <th key={i + 1}>
                  <span className="mr-1">{m.replace(/[^a-z0-9.]/ig, '$&\u200b')} (p-value)</span>
                  <SortButton sorted={sortCol === i + 1}
                              sortFunc={sortFunc.bind(undefined, i + 1)}
                              ascending={ascending}/>
                </th>;
              }
              return <th key={i + 1}/>;
            }).value()}
          </tr>
          </thead>
          <tbody>
          {_(_.get(enrichmentData, 'result', []))
            .orderBy(
              (_.isNull(sortCol) ?
                _.noop :
                (row) => typeof row[sortCol] === 'number' ?
                  row[sortCol] :
                  (ascending ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY)),
              ascending ? 'asc' : 'desc')
            .map((row, i) => {
              return <tr key={i}>
                <td>{row[0]}</td>
                {_.map(row.slice(1), (c, j) => {
                  if (typeof c === 'number') {
                    return <td key={j} style={blueShader(c, min, max)}>{c.toExponential(5)}</td>;
                  }
                  return <td key={j}/>;
                })}
              </tr>;
            })
            .value()}
          </tbody>
        </table>
      </div>
    </div>

  </div>;
};

AdditionalMotifsBody.propTypes = {
  requestId: PropTypes.string,
  alpha: PropTypes.number,
  motifRegions: PropTypes.array,
  setBusy: PropTypes.func
};

const AdditionalMotifs = connect(mapStateToProps, {setBusy})(AdditionalMotifsBody);
export default AdditionalMotifs;
