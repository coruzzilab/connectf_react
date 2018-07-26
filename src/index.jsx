/**
 * @author zachary juang
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter as Router, withRouter} from 'react-router-dom';
import $ from 'jquery';

import 'file-loader?name=[name].[ext]!./index.html';

import 'bootstrap/less/bootstrap.less';
import 'bootstrap/less/theme.less';
import './css/style.css';

import 'font-awesome/less/font-awesome.less';

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
