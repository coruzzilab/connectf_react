/**
 * @author zachary juang
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {createStore, applyMiddleware, compose, combineReducers} from 'redux';
import {Provider} from 'react-redux';
import {BrowserRouter as Router, withRouter} from 'react-router-dom';
import thunk from 'redux-thunk';
import $ from 'jquery';
import _ from 'lodash';

import 'file-loader?name=[name].[ext]!./index.html';

import 'bootstrap/less/bootstrap.less';
import 'bootstrap/less/theme.less';
import './css/style.css';

import 'font-awesome/less/font-awesome.less';

// Set up ajax default options before they are used
$.ajaxSetup({
  traditional: true
});

import tgdbApp from './reducers';

import _App from './components/app';
import {loadState, saveState} from "./local_storage";

/*
 * Enhancer composer for development. Connects to redux browser extension.
 */
const composeEnhancers = process.env.NODE_ENV !== 'production' &&
typeof window === 'object' &&
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const persistedState = loadState();

const store = createStore(
  combineReducers({
    ...tgdbApp
  }),
  persistedState,
  composeEnhancers(
    applyMiddleware(
      thunk
    )
  )
);

store.subscribe(_.throttle(function () {
  saveState(_.pick(store.getState(), [
    'query',
    'queryTree',
    'requestId',
    'result'
  ]))
}, 1000));

const App = withRouter(_App);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App/>
    </Router>
  </Provider>,
  document.getElementById('app')
);
