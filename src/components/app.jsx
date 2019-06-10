/**
 * @author zacharyjuang
 */
import React from 'react';
import {Link, Redirect, Route, Switch} from 'react-router-dom';
import {Collapse, Nav, Navbar, NavbarToggler} from 'reactstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import classNames from 'classnames';

import About from './about';
import Result from './result';
import QueryBuilder from './querybuilder';
import Network from './network';
import Feedback from './feedback';
import Tutorial from './tutorial';
import {NavItem} from "./common";
import Overview from './overview';

const Brand = styled(Link).attrs(({className}) => ({
  className: classNames(className, 'navbar-brand'),
  to: '/query'
}))`
  text-decoration: none;
  color: inherit;
`;

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
        <Brand><FontAwesomeIcon icon="dna" className="mr-1"/>ConnecTF</Brand>
        <NavbarToggler onClick={this.toggle.bind(this)}/>
        <Collapse isOpen={this.state.isOpen} navbar>
          <Nav className="ml-auto" navbar>
            <NavItem to={"/"}>About</NavItem>
            <NavItem to={"/tutorial"}>Tutorial</NavItem>
            <NavItem to={"/query"}>Query</NavItem>
            <NavItem to={"/overview"}>Data Overview</NavItem>
            <NavItem to={"/feedback"}>Feedback</NavItem>
          </Nav>
        </Collapse>
      </Navbar>
      <Switch>
        <Route exact path="/" component={About}/>
        <Route path="/tutorial" component={Tutorial}/>
        <Route path="/query" component={QueryBuilder}/>
        <Route path="/overview" component={Overview}/>
        <Route path="/feedback" component={Feedback}/>
        <Route path="/network" component={Network}/>
        <Route path="/result" component={Result}/>
        <Redirect to="/"/>
      </Switch>
    </div>;
  }
}

export default App;
