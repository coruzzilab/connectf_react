/**
 * Created by zacharyjuang on 11/24/16.
 */
import {combineReducers} from 'redux';
import {routerReducer} from 'react-router-redux';


const busy = (state = false, action) => {
  switch (action.type) {
  case 'SET_BUSY':
    return action.busy;
  case 'TOGGLE_BUSY':
    return !state;
  default:
    return state;
  }
};

const tgdbApp = combineReducers({
  busy,
  routing: routerReducer
});

export default tgdbApp;
