/**
 * @author zacharyjuang
 */
import React from 'react';
import {Link, Switch, Route, Redirect} from 'react-router-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import About from './about';
import Datagrid from './datagrid';
import QueryBuilder from './querybuilder';
import Cytoscape from './cytoscape';
import Feedback from './feedback';
import UploadAnalysis from './upload_analysis';
import UploadExperiment from './upload_experiment';

/**
 * Main app component
 */
class App extends React.Component {
  render() {
    let {pathname} = this.props.location;

    return <div style={{height: '100%'}}>
      <div>
        <h1>TF2TargetDB</h1>
      </div>
      <nav className="navbar navbar-default">
        <div className="container-fluid">
          <ul className="nav navbar-nav">
            <li className={classNames({active: pathname === "/"})}>
              <Link to="/">About</Link>
            </li>
            <li className={classNames({active: pathname === "/query"})}>
              <Link to="/query">Query</Link>
            </li>
            <li className={classNames({active: pathname === "/upload_experiment"})}>
              <Link to="/upload_experiment">Upload Experiment</Link>
            </li>
            <li className={classNames({active: pathname === "/upload_analysis"})}>
              <Link to="/upload_analysis">Upload Analysis</Link>
            </li>
            <li className={classNames({active: pathname === "/feedback"})}>
              <Link to="/feedback">Feedback</Link>
            </li>
          </ul>
        </div>
      </nav>
      <Switch>
        <Route exact path="/" component={About}/>
        <Route path="/query" component={QueryBuilder}/>
        <Route path="/upload_analysis" component={UploadAnalysis}/>
        <Route path="/upload_experiment" component={UploadExperiment}/>
        <Route path="/feedback" component={Feedback}/>
        <Route path="/cytoscape" component={Cytoscape}/>
        <Route path="/datagrid/:key" component={Datagrid}/>
        <Redirect from="/datagrid" to="/datagrid/table"/>
      </Switch>
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
  location: PropTypes.object
};

export default App;
