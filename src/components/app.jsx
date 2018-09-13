/**
 * @author zacharyjuang
 */
import React from 'react';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Collapse, Nav, Navbar, NavbarBrand, NavbarToggler} from 'reactstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import About from './about';
import Result from './result';
import QueryBuilder from './querybuilder';
import Cytoscape from './cytoscape';
import Feedback from './feedback';
import Tutorial from './tutorial';
import {NavItem} from "./common";

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
    return <div>
      <Navbar color="light" light expand="md">
        <NavbarBrand><FontAwesomeIcon icon="dna" className="mr-1"/>TF2TargetDB</NavbarBrand>
        <NavbarToggler onClick={this.toggle.bind(this)}/>
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem to={"/"}>About</NavItem>
            <NavItem to={"/tutorial"}>Tutorial</NavItem>
            <NavItem to={"/query"}>Query</NavItem>
            <NavItem to={"/feedback"}>Feedback</NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <Switch>
        <Route exact path="/" component={About}/>
        <Route path="/tutorial" component={Tutorial}/>
        <Route path="/query" component={QueryBuilder}/>
        <Route path="/feedback" component={Feedback}/>
        <Route path="/cytoscape" component={Cytoscape}/>
        <Route path="/result" component={Result}/>
        <Redirect to="/"/>
      </Switch>
    </div>;
  }
}

export default App;
