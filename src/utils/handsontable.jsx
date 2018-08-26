/**
 * @author zacharyjuang
 * 8/25/18
 */
import Handsontable from 'handsontable';
import _ from "lodash";

import 'handsontable/dist/handsontable.full.css';

function renderFc(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.NumericRenderer.apply(this, arguments);
  if (_.isFinite(value)) {
    if (value >= 0) {
      td.style.background = 'lightgreen';
    } else if (value < 0) {
      td.style.background = 'lightcoral';
    }
  }
  renderExp.apply(this, arguments);
}

function renderBold(instance, td, row, col, prop, value, cellProperties) {
  if (_.isNumber(value)) {
    Handsontable.renderers.NumericRenderer.apply(this, arguments);
  } else {
    Handsontable.renderers.TextRenderer.apply(this, arguments);
  }

  td.style.border = '1px solid black';
  td.className += ' font-weight-bold';
}

function renderExp(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.NumericRenderer.apply(this, arguments);
  if (_.isFinite(value)) {
    td.textContent = value.toExponential(2);
  }
}

function exponentialValidator(value, callback) {
  if (value == null) {
    value = '';
  }
  if (this.allowEmpty && value === '') {
    callback(true);

  } else if (value === '') {
    callback(false);

  } else {
    callback(/^-?\d+(\.\d+)?(e[+-]\d+)?$/.test(value));
  }
}

Handsontable.renderers.registerRenderer('renderBold', renderBold);
Handsontable.renderers.registerRenderer('renderFc', renderFc);
Handsontable.renderers.registerRenderer('renderExp', renderExp);

Handsontable.validators.registerValidator('exponential', exponentialValidator);

Handsontable.cellTypes.registerCellType('p_value', {
  renderer: 'renderExp',
  validator: 'exponential'
});

export default Handsontable;
