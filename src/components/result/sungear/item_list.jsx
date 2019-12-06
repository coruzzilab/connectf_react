import React from "react";
import _ from "lodash";
import {FixedSizeList as List} from "react-window";
import PropTypes from "prop-types";
import {resizeListWrapper} from "./utils";

class ItemListBody extends React.PureComponent {
  renderItem({index, style}) {
    let item = this.props.items[index];
    let metadata = this.props.itemMetadata[item];
    let symbol = _.get(metadata, 'symbol');

    return <li className="list-group-item" style={style}>
      {item} {symbol ? <span className="text-secondary">({symbol})</span> : null}
    </li>;
  }

  render() {
    return <List className={this.props.className}
                 ref={this.props.listRef}
                 innerElementType={"ul"}
                 itemSize={50}
                 height={this.props.height}
                 itemCount={this.props.items.length}>
      {this.renderItem.bind(this)}
    </List>;
  }
}

ItemListBody.propTypes = {
  items: PropTypes.array.isRequired,
  itemMetadata: PropTypes.object,
  height: PropTypes.number.isRequired,
  listRef: PropTypes.object,
  className: PropTypes.string
};

const ItemList = resizeListWrapper(ItemListBody);

export default ItemList;
