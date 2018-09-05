/**
 * @author zachary juang
 */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter as Router} from 'react-router-dom';
import $ from 'jquery';

import 'bootstrap/dist/css/bootstrap.css';
import './styles/style.scss';

import './fontawesome';
import store from './store';

import App from './components/app';

// Set up ajax default options before they are used
$.ajaxSetup({
  traditional: true
});

ReactDOM.render(
  <Provider store={store}>
    <Router>
      <App/>
    </Router>
  </Provider>,
  document.getElementById('app')
);
