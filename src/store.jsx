/**
 * @author zacharyjuang
 * 7/26/18
 */
import {applyMiddleware, compose, createStore} from 'redux';
import thunk from 'redux-thunk';
import _ from 'lodash';

import reducers from './reducers';
import {loadState, saveState} from "./local_storage";
import {clearRequestId, setBusy, setResult} from "./actions";
import {getTable} from "./utils/axios_instance";

/*
 * Enhancer composer for development. Connects to redux browser extension.
 */
const composeEnhancers = process.env.NODE_ENV !== 'production' &&
typeof window === 'object' &&
window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ : compose;

const persistedState = loadState();

const store = createStore(
  reducers,
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
    'edges',
    'queryHistory',
    'extraFields'
  ]));
}, 1000));

// Fun with notifications
let busy = 0;

store.subscribe(function () {
  let currBusy = store.getState().busy;

  if (currBusy !== busy) {
    if (busy > 0 && currBusy === 0) {
      if (!document.hasFocus()) {
        if (Notification.permission === "granted") {
          let n = new Notification("Done!", {body: "The results are in."});
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            if (permission === "granted") {
              let n = new Notification("Done!", {body: "The results are in."});
            }
          });
        }
      }
    }

    busy = currBusy;
  }
});

store.dispatch(function (dispatch) {
  let state = store.getState();

  if (state.requestId && _.isEmpty(state.result)) {
    dispatch(setBusy(true));
    getTable(state.requestId)
      .then((response) => {
        if (state.requestId === store.getState().requestId) {
          dispatch(setResult(response.data));
        }
      })
      .catch(() => {
        if (state.requestId === store.getState().requestId) {
          dispatch(clearRequestId());
        }
      })
      .then(() => {
        dispatch(setBusy(false));
      });
  }
});

export default store;
