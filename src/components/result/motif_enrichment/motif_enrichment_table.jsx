/**
 * @author zacharyjuang
 * 11/9/18
 */
import React, {useState} from "react";
import _ from "lodash";
import {columnString, getLogMinMax, redShader} from "../../../utils";
import {SortButton} from "../common";
import PropTypes from "prop-types";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import classNames from "classnames";
import {BASE_COLORS, ColHeader, makeLines} from "./common";

const FrozenTd = styled.td`
  position: sticky;
  left: 0px;
`;

export const RowHeader = ({data}) => {
  let [visible, setVisible] = useState(false);
  let hideModal = setVisible.bind(undefined, false);
  let showModal = setVisible.bind(undefined, true);

  return <FrozenTd className="p-0">
    <div className="w-100 h-100 bg-white border p-1">
      <a className="text-secondary" style={{cursor: 'pointer'}}
         onClick={showModal}>{data.name} {data['Family']}</a>
    </div>
    <Modal isOpen={visible} toggle={hideModal} size="lg">
      <ModalHeader toggle={hideModal}>
        {data.name} {data['Family']}
      </ModalHeader>
      <ModalBody>
        <table className="table table-sm table-responsive">
          <tbody>
          {data['# Motifs'] ? <tr>
              <th className="font-weight-bold">Number of Motifs</th>
              <td>{data['# Motifs']}</td>
            </tr> :
            null}
          {data['Consensus'] ? <tr>
              <th className="font-weight-bold">Consensus</th>
              <td className="font-weight-bold">
                {_.map(data['Consensus'], (cons, i) => {
                  return <span key={i}
                               style={{
                                 color: _.get(BASE_COLORS, _.lowerCase(cons), BASE_COLORS['other'])
                               }}>{cons}</span>;
                })}
              </td>
            </tr> :
            null}
          {data['Family'] ? <tr>
              <th className="font-weight-bold">Family</th>
              <td>{data['Family']}</td>
            </tr> :
            null}
          {_(data).omit(['# Motifs', 'Family', 'Consensus', 'name']).map((val, key) => {
            return <tr key={key}>
              <th className="font-weight-bold">{key}</th>
              <th>
                {/^data:image\//.test(val) ?
                  <img src={val} alt={key}/> :
                  <pre>{val}</pre>}
              </th>
            </tr>;
          }).value()}
          </tbody>
        </table>
      </ModalBody>
      <ModalFooter>
        <Button onClick={hideModal}><FontAwesomeIcon icon="times" className="mr-1"/>Close</Button>
      </ModalFooter>
    </Modal>
  </FrozenTd>;
};

RowHeader.propTypes = {
  data: PropTypes.object,
  children: PropTypes.node
};

class MotifEnrichmentTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sortCol: null,
      ascending: true
    };
  }

  sortFunc(i) {
    let {sortCol, ascending} = this.state;

    if (sortCol !== i) {
      this.setState({
        sortCol: i,
        ascending: true
      });
    } else if (ascending) {
      this.setState({
        ascending: false
      });
    } else if (!ascending) {
      this.setState({
        ascending: true,
        sortCol: null
      });
    }
  }

  render() {
    let {ascending, sortCol} = this.state;
    let {table, colSpan, height} = this.props;
    let [min, max] = getLogMinMax(_.get(table, 'result', []));

    let divider = _.findLastIndex(_.get(table, 'columns', []), (o) => _.has(o, 'filter'));
    let numRegion = _.get(table, 'regions.length', 0);

    return <div className="table-responsive" style={{maxHeight: height, overflowY: 'auto'}}>
      <table className="table table-bordered table-sm text-nowrap">
        <thead>
        <tr>
          <th/>
          {_(_.get(table, 'columns', [])).map((val, i) => {
            let [line1, line2] = makeLines(val);

            return <ColHeader key={i}
                              data={val}
                              colSpan={colSpan}
                              className={classNames({divider: divider === i})}>
              <button className="btn btn-link text-nowrap">
                <p className="m-0">{columnString(i + 1)} — {line1}</p>
                {line2 ? <p className="m-0">{line2}</p> : null}
              </button>
            </ColHeader>;
          }).value()}
        </tr>
        <tr>
          <FrozenTd/>
          {_(_.get(table, 'columns', [])).map((val, i) => {
            let indeces = _.map(_.range(1, numRegion + 1), (j) => i * numRegion + j);
            return _.map(_.zip(table.regions, indeces), ([r, idx]) => {
              return <th key={idx} className={classNames({divider: idx === (divider + 1) * numRegion})}>
                <span className="mr-1">{r} (p-value)</span>
                <SortButton sorted={sortCol === idx}
                            sortFunc={this.sortFunc.bind(this, idx)}
                            ascending={ascending}/>
              </th>;
            });
          }).flatten().value()}
        </tr>
        </thead>
        <tbody>
        {_(_.get(table, 'result', []))
          .orderBy(
            _.isNull(sortCol) ?
              (row) => parseInt(row[0].name.split('_')[1]) :
              (row) => typeof row[sortCol] === 'number' ?
                row[sortCol] :
                (ascending ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY),
            ascending ? 'asc' : 'desc')
          .map((row, i) => {
            return <tr key={i}>
              <RowHeader data={row[0]}/>
              {_.map(row.slice(1), (c, j) => {
                if (typeof c === 'number') {
                  return <td key={j}
                             className={classNames({divider: (j + 1) === (divider + 1) * numRegion})}
                             style={redShader(c, min, max)}>{c.toExponential(5)}</td>;
                }
                return <td key={j} className={classNames({divider: (j + 1) === (divider + 1) * numRegion})}/>;
              })}
            </tr>;
          })
          .value()}
        </tbody>
      </table>
    </div>;
  }
}

MotifEnrichmentTable.propTypes = {
  table: PropTypes.object.isRequired,
  colSpan: PropTypes.number,
  height: PropTypes.number
};

MotifEnrichmentTable.defaultProps = {
  colSpan: 1
};

export default MotifEnrichmentTable;
