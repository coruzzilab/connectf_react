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
const qEndRegex = /^\w+/;

class QueryAutocomplete extends React.Component {
  constructor(props) {
    super(props);
    this.textArea = React.createRef();

    this.state = {
      tfs: [],
      selectionEnd: undefined
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
      ref={this.textArea}
      renderInput={({onChange, ...props}) => (
        <textarea {...props} className="form-control rounded-0"
                  value={this.props.value}
                  placeholder="Search Transcription Factor..."
                  style={{width: '100%', height: '100%'}}
                  onChange={(e) => {
                    this.props.setQuery(e.target.value);
                    onChange(e);
                  }}
                  onSelect={(e) => {
                    this.setState({selectionEnd: e.currentTarget.selectionEnd});
                  }}/>)}
      renderItem={(item, isHighlighted) =>
        <div className={classNames('dropdown-item', {active: isHighlighted})}
             key={item.value}>{item.value} {item.name ?
          <span className="text-secondary">({item.name})</span> : null}</div>}
      getItemValue={(item) => item.value}
      wrapperProps={{className: 'form-control p-0 d-inline-block border-0'}}
      wrapperStyle={{height: 'auto'}}
      renderMenu={function (items, value, {minWidth, top}) {
        return <div style={{minWidth, maxHeight: document.documentElement.clientHeight - top || 0, overflowY: 'scroll'}}
                    className={classNames("dropdown-menu", {show: items.length})}>
          {items}
        </div>;
      }}
      onSelect={(item) => {
        let {value, setQuery} = this.props;
        let {selectionEnd} = this.state;

        if (value) {
          setQuery(value.slice(0, selectionEnd).replace(qRegex, '$1' + item) + value.slice(selectionEnd).replace(qEndRegex, ''));
          try {
            if (value.length > selectionEnd) {
              _.defer(() => {
                this.textArea.current.refs.input.setSelectionRange(selectionEnd, selectionEnd);
              });
            }
          } catch (e) {
            // do nothing
          }
        } else {
          setQuery(item);
        }
      }}
      items={this.state.tfs}
      shouldItemRender={(item) => {
        let {selectionEnd} = this.state;
        let searchVal = this.props.value.slice(0, selectionEnd);

        {
          let m = /\[[^[\]]+$/.exec(searchVal);

          if (m) {
            return false;
          }
        }

        {
          let m = qRegex.exec(searchVal);

          if (m) {
            let r = new RegExp(_.escapeRegExp(m[0].trim()), 'i');

            return item.value.search(r) !== -1 || (item.name && item.name.search(r) !== -1);
          }
        }

        return !this.props.value.slice(0, selectionEnd);
      }}/>;
  }
}

QueryAutocomplete.propTypes = {
  value: PropTypes.string.isRequired,
  setQuery: PropTypes.func.isRequired
};

export default QueryAutocomplete;
