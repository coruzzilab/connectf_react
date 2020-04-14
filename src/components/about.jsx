/**
 * @author zacharyjuang
 * 6/14/17
 */
import React from 'react';
import {Link} from 'react-router-dom';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';
import {TwitterFollow} from "./common";

const DataOverViewLink = () => (<Link to="/overview" className="btn btn-primary">
  <Icon icon="search" className="mr-2"/>Data Overview</Link>);

class About extends React.Component {
  render() {
    return <div className="container-fluid">
      <div className="row">
        <div className="col p-0">
          <div className="jumbotron jumbotron-fluid">
            <div className="container">
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
                  <Link to="/query" className="btn btn-primary btn-lg">Get Started
                    <Icon icon="chevron-circle-right" className="ml-2"/></Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col p-0">
          <div className="container">
            <div className="row mb-4">
              <div className="col border rounded rounded-lg m-1 p-2">
                <div className="row">
                  <div className="col">
                    Data Overview Text Here
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <DataOverViewLink/>
                  </div>
                </div>
              </div>
              <div className="col border rounded rounded-lg m-1 p-2">
                <div className="row">
                  <div className="col">
                    <p>
                      Quick search for Transcription Factors in the database.
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <div className="input-group">
                      <input type="text" className="form-control" placeholder="AT5G65210"/>
                      <div className="input-group-append">
                        <button className="btn btn-primary" type="button">Search</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col border rounded rounded-lg m-1 p-2">
                <div className="row">
                  <div className="col">
                    <p>
                      Choose from provided gene lists or upload your own list to limit query result.
                    </p>
                  </div>
                </div>
                <div className="row">
                  <div className="col">
                    <select className="form-control">
                      <option value="lists">Lists</option>
                    </select>
                  </div>
                </div>

              </div>
            </div>

            <div className="row">
              <div className="col-1"/>
              <div className="col-6 d-flex flex-column justify-content-center">
                <h3>Networks</h3>
                <p>
                  Visualize interactions between queried transcription factors and its targets as a network.
                </p>
              </div>
              <div className="col-4">
                <img src={require('../images/about_network.svg')} alt="network" className="img-fluid"/>
              </div>
              <div className="col-1"/>
            </div>
            <hr/>

            <div className="row">
              <div className="col-1"/>
              <div className="col-6 d-flex flex-column justify-content-center">
                <h3>Motif Enrichment</h3>
                <p>
                  Discover enriched transcription factor binding motifs in different gene regions.
                </p>
              </div>
              <div className="col-4">
                <img src={require('../images/about_motif.svg')} alt="motif enrichment" className="img-fluid"/>
              </div>
              <div className="col-1"/>
            </div>
            <hr/>

            <div className="row">
              <div className="col-1"/>
              <div className="col-6 d-flex flex-column justify-content-center">
                <h3>Gene Set Enrichment</h3>
                <p>
                  Visualize pairwise significance of overlap between queried analyses.
                </p>
              </div>
              <div className="col-4">
                <img src={require('../images/about_geneset.svg')} alt="gene set enrichment" className="img-fluid"/>
              </div>
              <div className="col-1"/>
            </div>
            <hr/>

            <div className="row">
              <div className="col-1"/>
              <div className="col-6 d-flex flex-column justify-content-center">
                <h3>Sungear</h3>
                <p>
                  Visualize common genes between different queried analyses.
                </p>
              </div>
              <div className="col-4">
                <img src={require('../images/about_sungear.svg')} alt="sungear" className="img-fluid"/>
              </div>
              <div className="col-1"/>
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
