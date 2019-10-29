import React from "react";
import {buildSearchRegex} from "./utils";
import PropTypes from "prop-types";
import _ from 'lodash';

/**
 * @author zacharyjuang
 * 10/28/19
 */
export class Search extends React.Component {
  constructor(props) {
    super(props);

    this.searchIntersects = _.debounce(this.searchIntersects.bind(this), 150);
  }

  componentDidUpdate(prevProps) {
    let {value} = this.props;

    if (value !== prevProps.value) {
      this.searchIntersects(value);
    }
  }

  searchIntersects(value) {
    let {onSelectChange, data: {intersects, gene_annotation: geneAnnotation}} = this.props;

    if (value) {
      let searchRegex = buildSearchRegex(value);
      let searchFunc = (s) => {
        if (s) {
          return searchRegex.test(s);
        }
        return false;
      };

      onSelectChange(_(intersects)
        .map((n, i) => {
          let _genes = _(n[2]);
          let _anno = _genes.map((g) => _.get(geneAnnotation, g));

          if (_genes.findIndex(searchFunc) !== -1 ||
            _anno.map('symbol').findIndex(searchFunc) !== -1 ||
            _anno.map('name').findIndex(searchFunc) !== -1) {
            return i;
          }
        })
        .filter(_.negate(_.isUndefined))
        .value());
    } else {
      onSelectChange([]);
    }

  }

  render() {
    return <input type="search"
                  className="form-control"
                  placeholder="Search"
                  value={this.props.value}
                  onChange={this.props.onChange}/>;
  }
}

Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  selected: PropTypes.array,
  onSelectChange: PropTypes.func,
  data: PropTypes.object
};

export default Search;
