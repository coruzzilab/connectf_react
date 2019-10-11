/**
 * @author zacharyjuang
 * 8/27/18
 */
import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import tutoriadMd from '!!html-loader!markdown-loader!toc-loader!./tutorial.md';


const Button = ({children, danger}) => (
  <span className={classNames("d-inline-block btn btn-sm", danger ? "btn-danger" : "btn-success")}>
    {children}
    </span>);

Button.propTypes = {
  children: PropTypes.node,
  danger: PropTypes.bool
};

class Tutorial extends React.Component {
  render() {
    return <div className="container">
      <div className="row">
        <div className="col">
          <div dangerouslySetInnerHTML={{__html: tutoriadMd}}/>
        </div>
      </div>
    </div>;
  }
}

export default Tutorial;
