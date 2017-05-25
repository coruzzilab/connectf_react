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
// import './css/style.css';

import tgdbApp from './reducers';

import App from './components/app';
import Datagrid from './components/datagrid';
import QueryBuilder from './components/querybuilder';
import Upload from './components/upload';

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
        <IndexRoute component={QueryBuilder}/>
        <Route path="datagrid" component={Datagrid}/>
        <Route path="upload" component={Upload}/>
      </Route>
    </Router>
  </Provider>,
  document.getElementById('app')
);
