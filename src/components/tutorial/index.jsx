/**
 * @author zacharyjuang
 * 8/27/18
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import tutoriadMd from '!!html-loader!custom-md-loader!toc-loader!./tutorial.md';


const Button = ({children, danger}) => (
  <span className={classNames("d-inline-block btn btn-sm", danger ? "btn-danger" : "btn-success")}>
    {children}
    </span>);

Button.propTypes = {
  children: PropTypes.node,
  danger: PropTypes.bool
};

class Tutorial extends React.Component {
  componentDidMount() {
    const scrollToAnchor = () => {
      const hashParts = window.location.hash.split('#');
      if (hashParts.length === 2) {
        const hash = hashParts[1];
        document.querySelector(`#${hash}`).scrollIntoView();
      }
    };
    scrollToAnchor();
    window.onhashchange = scrollToAnchor;
  }

  render() {
    return <div className="container-fluid">
      <div className="row">
        <div className="col" dangerouslySetInnerHTML={{__html: tutoriadMd}}/>
      </div>
    </div>;
  }
}

export default Tutorial;
