/**
 * @author zacharyjuang
 * 8/25/18
 */
import Handsontable from 'handsontable';
import _ from "lodash";
import classNames from 'classnames';
import {COLOR} from ".";

import 'handsontable/dist/handsontable.full.css';

function renderFc(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.NumericRenderer.apply(this, arguments);
  if (_.isFinite(value)) {
    if (value >= 0) {
      td.style.background = COLOR['INDUCED'];
    } else if (value < 0) {
      td.style.background = COLOR['REPRESSED'];
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
  td.className = classNames(td.className, 'font-weight-bold');
}

function renderGene(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.BaseRenderer.apply(this, arguments);
  td.style.border = '1px solid black';
  td.className = classNames(td.className, 'font-weight-bold');
  if (value) {
    let a = document.createElement('a');
    a.setAttribute(
      'href',
      `https://www.arabidopsis.org/servlets/Search?type=general&search_action=detail&method=1&show_obsolete=F&name=${encodeURIComponent(value)}&sub_type=gene`
    );
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener noreferrer');
    a.innerText = value;
    if (td.firstChild) {
      td.replaceChild(a, td.firstChild);
    } else {
      td.appendChild(a);
    }
  }
}

function renderExp(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.NumericRenderer.apply(this, arguments);
  if (_.isFinite(value)) {
    td.textContent = value.toExponential(2);
  }
}

function renderEdge(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);

  if (value === '*') {
    td.style.background = COLOR['EXPRESSION'];
  } else if (value) {
    td.style.background = COLOR['BOUND'];
  }
}

function renderNewLine(instance, td, row, col, prop, value, cellProperties) {
  Handsontable.renderers.TextRenderer.apply(this, arguments);
  if (value) {
    td.innerHTML = value.replace("\n", "<br/>");
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
Handsontable.renderers.registerRenderer('renderEdge', renderEdge);
Handsontable.renderers.registerRenderer('newline', renderNewLine);
Handsontable.renderers.registerRenderer('renderGene', renderGene);

Handsontable.validators.registerValidator('exponential', exponentialValidator);

Handsontable.cellTypes.registerCellType('p_value', {
  renderer: 'renderExp',
  validator: 'exponential'
});

export default Handsontable;
