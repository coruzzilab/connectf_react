import React from "react";
import {buildSearchRegex} from "./utils";
import PropTypes from "prop-types";
import _ from 'lodash';
import classNames from 'classnames';
import AutoComplete from "../../common/autocomplete";

export class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      exact: false,
      suggestions: []
    };

    this.searchIntersects = _.debounce(this.searchIntersects.bind(this), 150);
  }

  componentDidUpdate(prevProps, prevState) {
    let {value, data} = this.props;

    if (value !== prevProps.value || this.state.exact !== prevState.exact) {
      this.searchIntersects(value);
    }

    if (data !== prevProps.data) {
      this.getSuggestions();
    }
  }

  getSuggestions() {
    let {data} = this.props;

    let genes = _(data.intersects).map(2).flatten();
    let _anno = _(data['gene_annotation']).values();
    let names = _anno.map('name').compact();
    let symbols = _anno.map('symbol').compact();

    this.setState({
      suggestions: _([...genes.value(), ...names.value(), ...symbols.value()]).uniq().sortBy().value()
    });
  }

  searchIntersects(value) {
    let {onSelectChange, data: {intersects, gene_annotation: geneAnnotation}} = this.props;

    if (value) {
      let searchRegex = buildSearchRegex(value, this.state.exact);
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

  setExactMatch(e) {
    this.setState({
      exact: e.target.checked
    });
  }

  render() {
    let {className, value, onChange} = this.props;
    let {suggestions} = this.state;

    return <div className={classNames("row", className)}>
      <div className="col">
        <div className="row">
          <div className="col">
            <AutoComplete
              items={suggestions}
              inputProps={{
                placeholder: 'Search',
                className: 'form-control',
                type: "search"
              }}
              value={value}
              onChange={onChange}/>
          </div>
        </div>
        <div className="row">
          <div className="col">
            <label><input type="checkbox" value={this.state.exact}
                          onChange={this.setExactMatch.bind(this)}/> Exact Match</label>
          </div>
        </div>
      </div>
    </div>;
  }
}

Search.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  selected: PropTypes.array,
  onSelectChange: PropTypes.func,
  data: PropTypes.object,
  className: PropTypes.string
};

export default Search;
