/**
 * @author zacharyjuang
 * 6/14/17
 */
import React, {useEffect, useState} from 'react';
import PropTypes from "prop-types";
import {Link, withRouter} from 'react-router-dom';
import {FontAwesomeIcon as Icon} from '@fortawesome/react-fontawesome';
import {connect} from "react-redux";
import classNames from "classnames";
import {TwitterFollow} from "./common";
import AutoComplete from "./common/autocomplete";
import {getTFs} from "../utils/axios_instance";
import _ from "lodash";
import {setQuery} from "../actions";
import {TargetGeneSelection} from "./querybuilder/query_file";
import {SITE} from "../utils";

const DataOverviewLink = () => (<Link to="/overview" className="btn btn-primary">
  <Icon icon="search" className="mr-2"/>Data Overview</Link>);

function searchExample() {
  switch (SITE) {
  case "arabidopsis":
    return 'AT4G24020, NLP7';
  case "maize":
    return 'Zm00001d020430, ra1';
  default:
    return 'N/A';
  }
}

const renderItem = (item) => {
  if (item.name) {
    return <div>{item.value} <span className="text-secondary">{item.name}</span></div>;
  }
  return item.value;
};

const SearchBody = ({setQuery, history}) => {
  let [genes, setGenes] = useState([]);
  let [value, setValue] = useState("");

  useEffect(() => {
    getTFs({all: 0}).then(({data}) => {
      setGenes(data);
      let _value = _(data).map('value');
      if (SITE === 'arabidopsis' && _value.indexOf("AT4G24020") !== -1) {
        setValue("AT4G24020");
      } else if (SITE === 'maize' && _value.indexOf('Zm00001d020430') !== -1) {
        setValue('Zm00001d020430');
      }
    });
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    setQuery(value);
    history.push('/query', {submit: true});
  };

  return <form onSubmit={onSearch}>
    <div className="input-group">
      <AutoComplete value={value}
                    items={genes}
                    onChange={(e) => {
                      setValue(e.target.value);
                    }}
                    mapItemToValue={(o) => o.value}
                    mapItemToSearch={(o) => o.name + o.value}
                    renderItem={renderItem}
                    inputProps={{
                      placeholder: 'e.g. ' + searchExample(),
                      className: 'w-100 h-100 border-0 rounded-left',
                      type: "text",
                      required: true
                    }}
                    className="form-control p-0"/>
      <div className="input-group-append">
        <button className="btn btn-primary" type="submit">Search</button>
      </div>
    </div>
  </form>;
};

SearchBody.propTypes = {
  setQuery: PropTypes.func,
  history: PropTypes.object
};

const Search = _.flow(connect(null, {setQuery}), withRouter)(SearchBody);

const QueryExample = () => {
  switch (SITE) {
  case "arabidopsis":
    return 'AT4G24020 (NLP7)';
  case "maize":
    return 'Zm00001d020430 (ra1)';
  default:
    return 'N/A';
  }
};


const ArabidopsisOverview = () => (<table className="table small">
  <thead>
  <tr>
    <th/>
    <th>No. of TFs</th>
    <th>TF-target interactions</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <th>in planta TF-binding (ChIP-seq)</th>
    <td>26</td>
    <td>257,400</td>
  </tr>
  <tr>
    <th>in vitro TF-binding (DAP-seq)</th>
    <td>382</td>
    <td>3,335,595</td>
  </tr>
  <tr>
    <th>TF-regulation</th>
    <td>62</td>
    <td>145,283</td>
  </tr>
  </tbody>
</table>);

const MaizeOverview = () => (<table className="table small">
  <thead>
  <tr>
    <th/>
    <th>No. of TFs</th>
    <th>TF-target interactions</th>
  </tr>
  </thead>
  <tbody>
  <tr>
    <th>in planta TF-binding (ChIP-seq)</th>
    <td>107</td>
    <td>301,388</td>
  </tr>
  <tr>
    <th>in vitro TF-binding (DAP-seq)</th>
    <td>32</td>
    <td>492,814</td>
  </tr>
  <tr>
    <th>TF-regulation</th>
    <td>5</td>
    <td>45,008</td>
  </tr>
  </tbody>
</table>);

const DataOverview = () => {
  switch (SITE) {
  case "arabidopsis":
    return <ArabidopsisOverview/>;
  case "maize":
    return <MaizeOverview/>;
  default:
    return null;
  }
};

const About = () => {
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
                <Link to="/query" className="btn btn-primary btn-lg mr-4">Get Started
                  <Icon icon="chevron-circle-right" className="ml-2"/></Link>
                <a className={classNames(
                  "btn btn-lg mr-2",
                  SITE === 'arabidopsis' ? "btn-success" : "btn-primary")}
                   href="https://connectf.org">Arabidopsis</a>
                <a className={classNames(
                  "btn btn-lg mr-2",
                  SITE === 'maize' ? "btn-success" : "btn-primary")}
                   href="https://maize.connectf.org">Maize</a>
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
                  <h5>Data Overview</h5>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <DataOverview/>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <DataOverviewLink/>
                </div>
              </div>
            </div>
            <div className="col border rounded rounded-lg m-1 p-2">
              <div className="row">
                <div className="col">
                  <h5>Try it now</h5>
                  <p className="text-secondary">
                    Quick search for Transcription Factors in the database, e.g. <QueryExample/>.
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <Search/>
                </div>
              </div>
            </div>
            <div className="col border rounded rounded-lg m-1 p-2">
              <div className="row">
                <div className="col">
                  <h5>Limit results to target genes of interest</h5>
                  <p className="text-secondary">
                    Choose from provided gene lists or upload your own list to limit query result.
                  </p>
                </div>
              </div>
              <div className="row">
                <div className="col">
                  <TargetGeneSelection enableUpload/>
                </div>
              </div>

            </div>
          </div>

          <div className="row">
            <div className="col-1"/>
            <div className="col-6 d-flex flex-column justify-content-center">
              <Link to={"/tutorial#network"}><h3>Networks</h3></Link>
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
              <Link to={"/tutorial#aupr--area-under-precision-recall"}><h3>Precision—Recall Analysis (AUPR)</h3></Link>
              <p>
                Prune predicted networks using validated TF-target interactions returned by your query.
              </p>
            </div>
            <div className="col-4">
              <img src={require('../images/about_aupr.svg')} alt="network" className="img-fluid"/>
            </div>
            <div className="col-1"/>
          </div>
          <hr/>

          <div className="row">
            <div className="col-1"/>
            <div className="col-6 d-flex flex-column justify-content-center">
              <Link to={"/tutorial#motif-enrichment"}><h3>Motif Enrichment</h3></Link>
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
              <Link to={"/tutorial#gene-set-enrichment"}><h3>Gene Set Enrichment</h3></Link>
              <p>
                Visualize pairwise significance of overlap between queried TF-target analyses.
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
              <Link to={"/tutorial#sungear"}><h3>Sungear</h3></Link>
              <p>
                Visualize how target genes are distributed between queried TF-target analyses.
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
};

export default About;
