/**
 * @author zacharyjuang
 * 8/25/18
 */
import React from "react";
import PropTypes from "prop-types";

const QueryContext = React.createContext();

export class ImmobileInput extends React.Component {
  render() {
    return <QueryContext.Consumer>{value => {
      return <input onFocus={value.setDraggable.bind(undefined, false)}
                    onBlur={value.setDraggable.bind(undefined, true)}
                    autoFocus
                    {...this.props}/>;
    }}</QueryContext.Consumer>;
  }
}

class DragItemBody extends React.Component {
  constructor(props) {
    super(props);
    this.dropTarget = props.forwardedRef || React.createRef();
  }

  dragStart(value, e) {
    e.stopPropagation();
    e.dataTransfer.setData('id', this.props.node.id);

    let rect = this.dropTarget.current.getBoundingClientRect();
    value.setClientYOffset(e.clientY - rect.top - rect.height / 2);
  }

  dragOver(e) {
    e.preventDefault();
  }

  onDrop(clientYOffset, e) {
    e.stopPropagation();
    e.preventDefault();

    this.props.onDrop(clientYOffset, e);
  }

  render() {
    return <QueryContext.Consumer>{value => {
      return <div draggable={value.draggable} className={this.props.className}
                  ref={this.dropTarget}
                  id={this.props.node.id}
                  onDragStart={this.dragStart.bind(this, value)}
                  onDragOver={this.dragOver.bind(this)}
                  onDrop={this.onDrop.bind(this, value.clientYOffset)}>{this.props.children}</div>;
    }}</QueryContext.Consumer>;
  }
}

DragItemBody.propTypes = {
  children: PropTypes.node,
  node: PropTypes.object.isRequired,
  onDrop: PropTypes.func.isRequired,
  className: PropTypes.string,
  forwardedRef: PropTypes.object
};

export const DragItem = React.forwardRef((props, ref) => {
  return <DragItemBody {...props} forwardedRef={ref}/>;
});

class DragContainerBody extends React.Component {
  constructor(props) {
    super(props);
    this.dropTarget = props.forwardedRef || React.createRef();
    this.state = {
      draggable: true,
      clientYOffset: 0
    };
  }

  setDraggable(draggable) {
    this.setState({
      draggable
    });
  }

  setClientYOffset(clientYOffset) {
    this.setState({
      clientYOffset
    });
  }

  dragOver(e) {
    e.preventDefault();
  }

  onDrop(e) {
    let {clientYOffset} = this.state;

    e.stopPropagation();
    e.preventDefault();

    this.props.onDrop(clientYOffset, e);
  }

  render() {
    let {draggable, clientYOffset} = this.state;

    return <div className={this.props.className}
                ref={this.dropTarget}
                onDragOver={this.dragOver.bind(this)}
                onDrop={this.onDrop.bind(this)}>
      <div className="col">
        <QueryContext.Provider value={{
          draggable,
          setDraggable: this.setDraggable.bind(this),
          clientYOffset,
          setClientYOffset: this.setClientYOffset.bind(this)
        }}>
          {this.props.children}
        </QueryContext.Provider>
      </div>
    </div>;
  }
}

DragContainerBody.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  forwardedRef: PropTypes.object,
  onDrop: PropTypes.func.isRequired
};

export const DragContainer = React.forwardRef((props, ref) => {
  return <DragContainerBody {...props} forwardedRef={ref}/>;
});
