/**
 * @author zacharyjuang
 * 6/14/17
 */
import React from 'react';
import {Link} from 'react-router-dom';

class About extends React.Component {
  render() {
    return <div className="jumbotron jumbotron-fluid">
      <div className="container-fluid">
        <h1 className="display-4">Welcome to TF2TargetDB</h1>
        <p className="lead">
          Query transcription factor and target gene interactions.
        </p>
        <Link to="/query" className="btn btn-primary btn-lg">Get Started</Link>
      </div>
    </div>;
  }
}

export default About;
