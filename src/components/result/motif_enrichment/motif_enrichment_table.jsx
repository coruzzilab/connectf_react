/**
 * @author zacharyjuang
 * 11/9/18
 */
import React from "react";
import _ from "lodash";
import {blueShader, columnString, getLogMinMax} from "../../../utils";
import {SortButton} from "../common";
import PropTypes from "prop-types";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import styled from "styled-components";
import {BASE_COLORS} from "./index";
import {ColHeader} from "./common";

const FrozenTd = styled.td`
  position: sticky;
  left: 0px;
`;

export class RowHeader extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false
    };
  }

  showModal() {
    this.setState({
      visible: true
    });
  }

  hideModal() {
    this.setState({
      visible: false
    });
  }

  render() {
    let {visible} = this.state;
    let {data} = this.props;

    return <FrozenTd className="p-0">
      <div className="w-100 h-100 bg-white border p-1">
        <a className="text-secondary" style={{cursor: 'pointer'}}
           onClick={this.showModal.bind(this)}>{data.name} {data['Family']}</a>
      </div>
      <Modal isOpen={visible} toggle={this.hideModal.bind(this)}>
        <ModalHeader toggle={this.hideModal.bind(this)}>
          {data.name} {data['Family']}
        </ModalHeader>
        <ModalBody>
          <table className="table table-responsive table-sm">
            <tbody>
            <tr>
              <th className="font-weight-bold">Number of Motifs</th>
              <td>{data['# Motifs']}</td>
            </tr>
            <tr>
              <th className="font-weight-bold">Consensus</th>
              <td className="font-weight-bold">
                {_.map(data['Consensus'], (cons, i) => {
                  return <span key={i}
                               style={{
                                 color: _.get(BASE_COLORS, _.lowerCase(cons), BASE_COLORS['other'])
                               }}>{cons}</span>;
                })}
              </td>
            </tr>
            <tr>
              <th className="font-weight-bold">Family</th>
              <td>{data['Family']}</td>
            </tr>
            </tbody>
          </table>
        </ModalBody>
        <ModalFooter>
          <Button onClick={this.hideModal.bind(this)}><FontAwesomeIcon icon="times" className="mr-1"/>Close</Button>
        </ModalFooter>
      </Modal>
    </FrozenTd>;
  }
}

RowHeader.propTypes = {
  data: PropTypes.object,
  children: PropTypes.node
};

class MotifEnrichmentTable extends React.Component {
  constructor(props) {
    super(props);

    this.table = React.createRef();

    this.state = {
      height: 0,
      sortCol: null,
      ascending: true
    };

    this.setHeight = _.debounce(this.setHeight.bind(this), 100);
  }

  componentDidMount() {
    this.setHeight();
    window.addEventListener('resize', this.setHeight);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.setHeight);
  }

  setHeight() {
    this.setState({
      height: document.documentElement.clientHeight - this.table.current.getBoundingClientRect().top
    });
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
    let {height, ascending, sortCol} = this.state;
    let {table, colSpan} = this.props;
    let [min, max] = getLogMinMax(_.get(table, 'result', []));

    return <div className="table-responsive" style={{maxHeight: height, overflowY: 'auto'}} ref={this.table}>
      <table className="table table-bordered table-sm text-nowrap">
        <thead>
        <tr>
          <th/>
          {_(_.get(table, 'columns', {})).toPairs().map(([key, val], i) => {
            let line1 = val.name;
            if (val['gene_name']) {
              line1 += ` (${val['gene_name']})`;
            }
            let line2 = _(val).pick(['TECHNOLOGY', 'ANALYSIS_METHOD', 'ANALYSIS_CUTOFF']).values().join('-');
            return <ColHeader key={key}
                              data={val}
                              colSpan={colSpan}
                              sortFunc={this.sortFunc.bind(this, i + 1)}
                              sorted={sortCol === i + 1}
                              sortable={colSpan === 1}
                              ascending={ascending}>
              {!_.isEmpty(val) ?
                <div>
                  <p className="m-0">{columnString(i + 1)} — {line1}</p>
                  {line2 ? <p className="m-0">{line2}</p> : null}
                </div> :
                key}
            </ColHeader>;
          }).value()}
        </tr>
        <tr>
          <th/>
          {colSpan > 1 ?
            _(_.get(table, 'columns', [])).map((val, i) => {
              let numRegion = table.regions.length;
              let indeces = _.map(_.range(1, numRegion + 1), (j) => i * numRegion + j);
              return _.map(_.zip(table.regions, indeces), ([r, idx]) => {
                return <th key={idx}>
                  <span className="mr-1">{r} (p-value)</span>
                  <SortButton sorted={sortCol === idx}
                              sortFunc={this.sortFunc.bind(this, idx)}
                              ascending={ascending}/>
                </th>;
              });
            }).flatten().value() :
            _(_.get(table, 'columns', {})).map((val, key) => {
              return <th key={key}>promoter (p-value)</th>;
            }).value()}
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
                  return <td key={j} style={blueShader(c, min, max)}>{c.toExponential(5)}</td>;
                }
                return <td key={j}/>;
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
  colSpan: PropTypes.number
};

MotifEnrichmentTable.defaultProps = {
  colSpan: 1
};

export default MotifEnrichmentTable;
