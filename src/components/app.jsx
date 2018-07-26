/**
 * @author zacharyjuang
 */
import React from 'react';
import {Link, Switch, Route, Redirect} from 'react-router-dom';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {Navbar, Nav, NavItem, Collapse, NavbarToggler, NavLink} from 'reactstrap';

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
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    };
  }

  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  render() {
    let {pathname} = this.props.location;

    return <div style={{height: '100%'}}>
      <div>
        <h1>TF2TargetDB</h1>
      </div>
      <Navbar color="light" light expand="md">
        <NavbarToggler onClick={this.toggle.bind(this)}/>
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="mr-auto" navbar>
            <NavItem active={pathname === "/"}>
              <Link to="/" className="nav-link">About</Link>
            </NavItem>
            <NavItem active={pathname === "/query"}>
              <Link to="/query" className="nav-link">Query</Link>
            </NavItem>
            <NavItem active={pathname === "/upload_experiment"}>
              <Link to="/upload_experiment" className="nav-link">Upload Experiment</Link>
            </NavItem>
            <NavItem active={pathname === "/upload_analysis"}>
              <Link to="/upload_analysis" className="nav-link">Upload Analysis</Link>
            </NavItem>
            <NavItem active={pathname === "/feedback"}>
              <Link to="/feedback" className="nav-link">Feedback</Link>
            </NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <Switch>
        <Route exact path="/" component={About}/>
        <Route path="/query" component={QueryBuilder}/>
        <Route path="/upload_analysis" component={UploadAnalysis}/>
        <Route path="/upload_experiment" component={UploadExperiment}/>
        <Route path="/feedback" component={Feedback}/>
        <Route path="/cytoscape" component={Cytoscape}/>
        <Route path="/datagrid" component={Datagrid}/>
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
