/**
 * @author zachary juang
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, compose} from 'redux';
import {Provider} from 'react-redux';
import {Router, Route, browserHistory} from 'react-router';
import {syncHistoryWithStore, routerMiddleware} from 'react-router-redux';

import 'file?name=[name].[ext]!./index.html';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/css/bootstrap-theme.css';
// import './css/style.css';

import 'bootstrap/dist/js/bootstrap';

import tgdbApp from './reducers';

import App from './components/app';
import Datagrid from './components/datagrid';

const composeEnhancers = process.env.NODE_ENV !== 'production' &&
typeof window === 'object' &&
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const store = createStore(tgdbApp,
  composeEnhancers(
    applyMiddleware(
      routerMiddleware(browserHistory)
    )
  )
);

const history = syncHistoryWithStore(browserHistory, store);

ReactDOM.render(
  <Provider store={store}>
    <Router history={history}>
      <Route path="/" component={App}/>
      <Route path="datagrid" component={Datagrid}/>
    </Router>
  </Provider>,
  document.getElementById('app')
);
