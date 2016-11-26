/**
 * Created by zacharyjuang on 11/26/16.
 */

export const setBusy = (busy) => {
  return {
    type: 'SET_BUSY',
    busy
  };
};

export const toggleBusy = () => {
  return {
    type: 'TOGGLE_BUSY'
  };
};
