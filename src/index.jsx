/**
 * @author zachary juang
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, compose, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {Router, Route, IndexRoute, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerMiddleware, routerReducer} from 'react-router-redux';
import thunk from 'redux-thunk';

import 'file-loader?name=[name].[ext]!./index.html';

import 'bootstrap/less/bootstrap.less';
import 'bootstrap/less/theme.less';
import './css/style.css';

import 'font-awesome/less/font-awesome.less';

import tgdbApp from './reducers';

import App from './components/app';
import Datagrid from './components/datagrid';
import QueryBuilder from './components/querybuilder';
import About from './components/about';
import CytoscapeFrame from './components/cytoscape';
import Cytoscape from './components/cytoscape/cytoscape';
import Feedback from './components/feedback';
import UploadAnalysis from './components/upload_analysis';
import UploadExperiment from './components/upload_experiment';

const composeEnhancers = process.env.NODE_ENV !== 'production' &&
typeof window === 'object' &&
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const store = createStore(
  combineReducers({
    ...tgdbApp,
    routing: routerReducer
  }),
  composeEnhancers(
    applyMiddleware(
      thunk,
      routerMiddleware(browserHistory)
    )
  )
);

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}>
        <IndexRoute component={About}/>
        <Route path="query" component={QueryBuilder}/>
        <Route path="datagrid" component={Datagrid}/>
        <Route path="cytoscape" component={CytoscapeFrame}>
          <Route path="query" component={() => <Cytoscape type="dbase_view1_cy"/>}/>
          <Route path="target" component={() => <Cytoscape type="targets_cy"/>}/>
          <Route path="genome" component={() => <Cytoscape type="genome_cy"/>}/>
        </Route>
        <Route path="feedback" component={Feedback}/>
        <Route path="upload_analysis" component={UploadAnalysis}/>
        <Route path="upload_experiment" component={UploadExperiment}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);
