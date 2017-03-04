/**
 * @author zacharyjuang
 */
import React from 'react';
import {IndexLink, Link} from 'react-router';
import classNames from 'classnames';

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
            <li className={classNames({active: pathname === "/"})}><IndexLink to="/">Home</IndexLink></li>
            <li className={classNames({active: pathname === "/upload"})}><Link to="upload">Upload</Link></li>
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
  children: React.PropTypes.node,
  router: React.PropTypes.object.isRequired
};

export default App;
