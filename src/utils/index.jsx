/**
 * @author zacharyjuang
 * 6/18/18
 */
import _ from 'lodash';
import moment from 'moment';

export function blueShader(c, min, max) {
  let l = 48 + Math.round(52 * ((Math.log10(c) - min) / (max - min)));
  l = l < 48 ? 48 : l;
  let background = c ? `hsl(228,89%,${l}%)` : '#FFFFFF';
  let color = l <= 65 && l >= 48 ? 'white' : 'black';

  return [background, color];
}

export function getLogMinMax(data) {
  let res = _(data).flatten().filter((n) => typeof n === 'number');

  return [Math.floor(Math.log10(res.min())), Math.ceil(Math.log10(res.max()))];
}

export function generateRequestId() {
  return moment.utc().format("Y-MM-DD[T]HHmmssSSS[Z]") + Math.floor(Math.random() * 1000).toString().padStart(3, "0");
}

let trimOper = /^(?:and|or)\s+/i;
let cleanMod = /\[\s*]/g;


function getMod(queryTree, id) {
  let curr = _(queryTree)
    .filter((o) => o.parent === id)
    .filter((o) => o.nodeType === 'MOD' || o.nodeType === 'MOD_GROUP');
  let query = curr.map((o) => {
    let s = o.oper + ' ';

    if (o.not_) {
      s += 'not ';
    }

    if (o.nodeType === 'MOD') {
      if (/\s/g.test(o.key)) {
        s += `"${o.key}"`;
      } else {
        s += o.key;
      }

      s += o.innerOper;

      if (/\s/g.test(o.value)) {
        s += `"${o.value}"`;
      } else {
        s += o.value;
      }
    } else if (o.nodeType === 'MOD_GROUP') {
      s += `(${getMod(queryTree, o.id)})`;
    }

    return s;
  }).join(' ');

  return query.replace(trimOper, '');
}


export function getQuery(queryTree, id) {
  let curr = _(queryTree).filter((o) => o.parent === id);
  let query = curr.map((o) => {
    let s = o.oper + ' ';

    if (o.not_) {
      s += 'not ';
    }

    if (o.nodeType === 'TF') {
      s += `${o.name}[${getMod(queryTree, o.id)}]`;
    } else if (o.nodeType === 'GROUP') {
      s += `(${getQuery(queryTree, o.id)})[${getMod(queryTree, o.id)}]`;
    }

    return s;
  }).join(' ');

  return query.replace(trimOper, '').replace(cleanMod, '');
}

function getDescendants(queryTree, node) {
  let curr = _(queryTree).filter((o) => o.parent === node.id);

  return curr.concat(curr.map((o) => {
    return getDescendants(queryTree, o);
  }).flatten().value()).value();
}

export function getParentTfTree(queryTree, node) {
  let parent = _.find(queryTree, ['id', _.get(node, 'parent')]);

  while (parent && (parent.nodeType !== 'TF' || parent.nodeType !== 'GROUP') && parent.parent) {
    parent = _.find(queryTree, ['id', parent.parent]);
  }

  if (parent.nodeType === 'TF') {
    return [parent];
  } else if (parent.nodeType === 'GROUP') {
    return getDescendants(queryTree, parent);
  }
}
