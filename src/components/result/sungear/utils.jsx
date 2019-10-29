/**
 * @author zacharyjuang
 * 10/28/19
 */
import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";

export function saveSvg(svgEl, name) {
  svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  let svgData = svgEl.outerHTML;
  let preface = '<?xml version="1.0" standalone="no"?>\r\n';
  let svgBlob = new Blob([preface, svgData], {type: "image/svg+xml;charset=utf-8"});
  let svgUrl = URL.createObjectURL(svgBlob);
  let downloadLink = document.createElement("a");
  downloadLink.href = svgUrl;
  downloadLink.download = name;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
}

export function resizeListWrapper(Tag) {
  class Wrapper extends React.Component {
    constructor(props) {
      super(props);

      this.itemRef = React.createRef();

      this.state = {
        height: 0
      };

      this.setSize = _.throttle(this.setSize.bind(this), 100);
    }

    componentDidMount() {
      this.setSize();
      window.addEventListener('resize', this.setSize);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.setSize);
    }

    setSize() {
      let {clientHeight} = document.documentElement;

      this.setState({
        height: clientHeight - this.itemRef.current.getBoundingClientRect().top
      });
    }

    render() {
      let {className, innerClassName, ...props} = this.props;
      return <div ref={this.itemRef} className={className}>
        <Tag height={this.state.height} className={innerClassName} {...props}/>
      </div>;
    }
  }

  Wrapper.propTypes = {
    className: PropTypes.string,
    innerClassName: PropTypes.string
  };

  return Wrapper;
}

export function buildSearchRegex(term) {
  return new RegExp(_.escapeRegExp(term), "i");
}
