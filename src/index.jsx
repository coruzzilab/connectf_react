/**
 * @author zachary juang
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter as Router, withRouter} from 'react-router-dom';
import $ from 'jquery';

import 'bootstrap/dist/css/bootstrap.css';
import './css/style.css';

import './fontawesome';

// Set up ajax default options before they are used
$.ajaxSetup({
  traditional: true
});

import store from './store';

import _App from './components/app';

const App = withRouter(_App);

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App/>
    </Router>
  </Provider>,
  document.getElementById('app')
);
