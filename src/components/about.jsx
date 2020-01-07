/**
 * @author zacharyjuang
 * 6/14/17
 */
import React from 'react';
import {Link} from 'react-router-dom';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';
import {UncontrolledCarousel} from 'reactstrap';
import {TwitterFollow} from "./common";

const IMAGES = [
  {
    src: require('../images/query.png').default,
    altText: 'Query Builder',
    header: 'Query Builder',
    caption: 'Construct queries with transcription factors in the database'
  },
  {
    src: require('../images/table.png').default,
    altText: 'Query Result',
    header: 'Query Result',
    caption: 'Tabular display of analysis results'
  },
  {
    src: require('../images/cytoscape.png').default,
    altText: 'Network',
    header: 'Network',
    caption: 'Transcription factor and target gene interaction network'
  },
  {
    src: require('../images/motif_enrichment.png').default,
    altText: 'Motif Enrichment',
    header: 'Motif Enrichment',
    caption: 'Enrichment of binding motifs in the promoter region'
  }
];

class About extends React.Component {
  render() {
    return <div>
      <div className="jumbotron jumbotron-fluid">
        <div className="container-fluid">
          <div className="row">
            <div className="col">
              <h1 className="display-4">Welcome to ConnecTF</h1>
              <p className="lead">
                Query transcription factor and target gene interactions.
              </p>
            </div>
          </div>
          <div className="row justify-content-sm-center">
            <div className="col">
              <Link to="/tutorial" className="btn btn-primary btn-lg mr-2">
                <Icon icon="book-open" className="mr-2"/>Learn More</Link>
              <Link to="/overview" className="btn btn-primary btn-lg mr-2">
                <Icon icon="search" className="mr-2"/>Data Overview</Link>
              <Link to="/query" className="btn btn-primary btn-lg">Get Started
                <Icon icon="chevron-circle-right" className="ml-2"/></Link>
            </div>
          </div>
          <div className="row justify-content-center">
            <div className="col-lg-6 col-md-10 col-sm my-2">
              <UncontrolledCarousel items={IMAGES} pause="hover" interval={10000}/>
            </div>
          </div>
        </div>
      </div>
      <footer>
        <TwitterFollow username="coruzzilab"/>
      </footer>
    </div>;
  }
}

export default About;
