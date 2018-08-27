import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import PropTypes from "prop-types";
import React from "react";
import {Tooltip, UncontrolledTooltip} from "reactstrap";
import classNames from 'classnames';

export const SortButton = ({sortFunc, sorted, ascending, ...props}) => {
  return <a onClick={sortFunc} {...props}>
    {sorted ?
      (ascending ? <FontAwesomeIcon icon="sort-up"/> : <FontAwesomeIcon icon="sort-down"/>) :
      <FontAwesomeIcon icon="sort"/>}</a>;
};

SortButton.propTypes = {
  sortFunc: PropTypes.func.isRequired,
  sorted: PropTypes.bool.isRequired,
  ascending: PropTypes.bool.isRequired
};

export class InfoTootip extends React.Component {
  constructor(props) {
    super(props);
    this.target = React.createRef();
  }

  render() {
    return <this.props.tag className={this.props.className}>
      <span ref={this.target}>{this.props.text || <FontAwesomeIcon icon="question-circle"/>}</span>
      <UncontrolledTooltip target={() => this.target.current} placement="auto">
        {this.props.children}
      </UncontrolledTooltip>
    </this.props.tag>;
  }
}

InfoTootip.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  tag: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
  text: PropTypes.node
};

InfoTootip.defaultProps = {
  tag: 'div'
};

export class QueryNameCell extends React.Component {
  constructor(props) {
    super(props);
    this.name = React.createRef();
    this.state = {
      tooltipOpen: false
    };
  }

  toggleTooltip() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen && (this.name.current.offsetWidth < this.name.current.scrollWidth)
    });
  }

  render() {
    return <td className="p-0 align-middle">
      <div className="query-name h-100" ref={this.name}>
        {this.props.children}
      </div>
      <Tooltip target={() => this.name.current} placement="right" isOpen={this.state.tooltipOpen} autohide={false}
               toggle={this.toggleTooltip.bind(this)}>{this.props.children}</Tooltip>
    </td>;
  }
}

QueryNameCell.propTypes = {
  children: PropTypes.node
};

export const SVGWarningTooltip = ({children, className}) => <InfoTootip className={className} text={children}>
  Open the SVG image with a browser to view the complete image. The table in the image might not render correctly
  in image editing software.
</InfoTootip>;

SVGWarningTooltip.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string
};
