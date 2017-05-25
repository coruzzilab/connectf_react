/**
 * @author zacharyjuang
 */
import React from 'react';
import {IndexLink, Link} from 'react-router';
import classNames from 'classnames';
import PropTypes from 'prop-types';

/**
 * Main app component
 */
class App extends React.Component {
  render() {
    let {router} = this.props;
    let {pathname} = router.getCurrentLocation();

    return <div>
      <div>
        <h1>TargetDB</h1>
      </div>
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <ul className="nav navbar-nav">
            <li className={classNames({active: pathname === "/"})}>
              <IndexLink to="/">Home</IndexLink>
            </li>
            <li className={classNames({active: pathname === "/upload"})}>
              <a href="http://coruzzilab-macpro.bio.nyu.edu/upload/">Upload</a>
            </li>
          </ul>
        </div>
      </nav>
      {this.props.children}
    </div>;
  }
}

/**
 * Receives router object from react-router
 * @memberOf App
 * @type {{router: (*)}}
 */
App.propTypes = {
  children: PropTypes.node,
  router: PropTypes.object.isRequired
};

export default App;
