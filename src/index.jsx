/**
 * @author zachary juang
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';
import "core-js/stable";
import "regenerator-runtime";

import 'bootstrap/scss/bootstrap.scss';
import './styles/style.scss';

import './fontawesome';
import store from './store';

import App from './components/app';

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App/>
    </Router>
  </Provider>,
  document.getElementById('app')
);
