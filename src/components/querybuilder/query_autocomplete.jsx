/**
 * @author zacharyjuang
 * 9/12/18
 */
import React from "react";
import $ from "jquery";
import {BASE_URL} from "../../actions";
import Autocomplete from "react-autocomplete";
import classNames from "classnames";
import _ from "lodash";
import PropTypes from "prop-types";

const qRegex = /(\s*)\w+$/;

class QueryAutocomplete extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tfs: []
    };
  }

  componentDidMount() {
    $.ajax({
      url: `${BASE_URL}/api/tfs/`,
      contentType: false
    }).done((tfs) => {
      this.setState({tfs});
    });
  }

  render() {
    return <Autocomplete
      renderInput={(props) => <textarea {...props} className="form-control rounded-0" value={this.props.value}
                                        placeholder="Search Transcription Factor..."
                                        style={{width: '100%', height: '100%'}}
                                        onChange={(e) => {
                                          this.props.onChange(e);
                                          props.onChange(e);
                                        }}/>}
      renderItem={(item, isHighlighted) =>
        <div className={classNames('dropdown-item', {active: isHighlighted})}
             key={item.value}>{item.value} {item.name ?
          <span className="text-secondary">({item.name})</span> : null}</div>}
      getItemValue={(item) => item.value}
      wrapperProps={{className: 'form-control p-0 d-inline-block border-0'}}
      wrapperStyle={{height: 'auto'}}
      renderMenu={function (items, value, {minWidth, top}) {
        return <div style={{minWidth, height: document.documentElement.clientHeight - top, overflowY: 'scroll'}}
                    className={classNames("dropdown-menu", {show: items.length})}>
          {items}
        </div>;
      }}
      onSelect={(item) => {
        if (this.props.value) {
          this.props.setQuery(this.props.value.replace(qRegex, '$1' + item));
        } else {
          this.props.setQuery(item);
        }
      }}
      items={this.state.tfs}
      shouldItemRender={(item) => {
        let m = qRegex.exec(this.props.value);

        if (m) {
          let r = new RegExp(_.escapeRegExp(m[0].trim()), 'i');

          return item.value.search(r) !== -1 || (item.name && item.name.search(r) !== -1);
        }

        return !this.props.value;
      }}/>;
  }
}

QueryAutocomplete.propTypes = {
  onChange: PropTypes.func.isRequired,
  value: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired
};

export default QueryAutocomplete;
