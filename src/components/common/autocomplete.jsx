import React, {useEffect, useState} from "react";
import {buildSearchRegex} from "../result/sungear/utils";
import _ from "lodash";
import classNames from "classnames";
import {FixedSizeList as List} from "react-window";
import PropTypes from "prop-types";

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;

function mod(n, m) {
  return ((n % m) + m) % m;
}

const AutoComplete = ({value, onChange, inputProps, items, className, mapItemToValue, mapItemToSearch, renderItem}) => {
  let searchRef = React.createRef();
  let listRef = React.createRef();
  let [active, setActive] = useState(-1);
  let [isOpen, setOpen] = useState(false);
  let [listStyle, setListStyle] = useState({width: 200, top: 0, left: 0});
  let [searchItems, setSearchItems] = useState(items);
  let [height, setHeight] = useState(200);

  useEffect(() => {
    setListStyle({
      width: Math.max(searchRef.current.offsetWidth, 200),
      top: searchRef.current.offsetHeight + searchRef.current.offsetTop,
      left: searchRef.current.offsetLeft
    });
    setHeight((document.documentElement.clientHeight - searchRef.current.getBoundingClientRect().bottom) * 0.8);
  }, [searchRef.current]);

  useEffect(() => {
    let searchRegex = buildSearchRegex(value);
    setSearchItems(_(items)
      .filter((o) => searchRegex.test(mapItemToSearch(o)))
      .value());
    setActive(-1);
    if (listRef.current) {
      listRef.current.scrollToItem(0, "auto");
    }
  }, [value, items]);

  const onClick = (e) => {
    nativeInputValueSetter.call(searchRef.current, mapItemToValue(searchItems[active]));
    searchRef.current.dispatchEvent(new Event('input', {bubbles: true}));
    setOpen(false);
    setActive(-1);
  };

  const renderItems = ({index, style}) => {
    let item = searchItems[index];
    let selected = active === index;
    return <li className={classNames("list-group-item text-nowrap text-truncate", {active: selected})}
               aria-selected={selected}
               style={style}
               onMouseDown={onClick}
               onMouseEnter={setActive.bind(undefined, index)}>
      {renderItem(item)}
    </li>;
  };

  const onKeyDown = (e) => {
    if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && !isOpen && !e.getModifierState('Alt')) {
      setOpen(true);
    }

    if (e.key === 'ArrowDown' && e.getModifierState('Alt')) {
      setOpen(true);
    }

    if ((e.key === 'ArrowUp' && e.getModifierState('Alt')) || e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }

    if (isOpen) {
      let currActive;
      if (e.key === 'ArrowUp') {
        e.preventDefault();

        currActive = active === -1 ? searchItems.length - 1 : mod(active - 1, searchItems.length);
        setActive(currActive);
        listRef.current.scrollToItem(currActive, "auto");
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        currActive = mod(active + 1, searchItems.length);
        setActive(currActive);
        listRef.current.scrollToItem(currActive, "auto");
      } else if (e.key === 'Enter') {
        nativeInputValueSetter.call(searchRef.current, mapItemToValue(searchItems[active]));
        searchRef.current.dispatchEvent(new Event('input', {bubbles: true}));
        setOpen(false);
        setActive(-1);
      }
    } else {
      if (value.length >= 1 && searchItems.length) {
        setOpen(true);
      }
    }
  };

  return <div role="combobox" className={classNames("mw-100", className)}>
    <input ref={searchRef}
           type="search"
           role="searchbox"
           aria-controls="autocomplete_list"
           aria-expanded={isOpen}
           aria-autocomplete="list"
           {...inputProps}
           value={value}
           onChange={onChange}
           onKeyDown={onKeyDown}
           onDoubleClick={(e) => {
             setOpen(true);
           }}
           onBlur={(e) => {
             setOpen(false);
             setActive(-1);
           }}/>
    {isOpen ? <List className="list-group"
                    id="autocomplete_list"
                    role="listbox"
                    ref={listRef}
                    innerElementType={"ul"}
                    itemSize={50}
                    height={height}
                    style={{position: 'absolute', zIndex: 100, overflowX: 'hidden', ...listStyle}}
                    itemCount={searchItems.length}>
        {renderItems}
      </List> :
      null}
  </div>;
};

AutoComplete.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  inputProps: PropTypes.object,
  items: PropTypes.array,
  className: PropTypes.string,
  mapItemToValue: PropTypes.func,
  mapItemToSearch: PropTypes.func,
  renderItem: PropTypes.func
};

AutoComplete.defaultProps = {
  mapItemToValue: _.identity,
  mapItemToSearch: _.identity,
  renderItem: _.identity
};

export default AutoComplete;
