/**
 * @author zacharyjuang
 * 6/18/18
 */
import _ from 'lodash';
import moment from 'moment';
import uuidv4 from "uuid/v4";

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
  let curr = _(queryTree)
    .filter((o) => o.parent === id)
    .filter((o) => o.nodeType === 'TF' || o.nodeType === 'GROUP');
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

export function getDescendants(queryTree, node) {
  if (_.isString(node)) {
    node = _.find(queryTree, ['id', node]);
  }

  let curr = _(queryTree).filter((o) => o.id === node.id);

  return curr
    .concat(_(queryTree)
      .filter((o) => o.parent === node.id)
      .map((o) => getDescendants(queryTree, o))
      .flatten()
      .value())
    .uniq()
    .value();
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

export function getLevel(queryTree, node) {
  let parent = _.find(queryTree, ['id', node.parent]);

  if (parent) {
    return getLevel(queryTree, parent) + 1;
  }
  return 0;
}

const GREYS = [
  '#FFFFFF',
  '#DFDFDF',
  '#BFBFBF',
  '#9F9F9F',
  '#808080'
];

export const getGrey = _.flow(
  getLevel,
  _.partial(_.clamp, _, 0, 4),
  _.partial(_.get, GREYS, _, GREYS[4])
);

export function addAfter(state, id, obj) {
  let prevLoc = _.findIndex(state, ['id', id]);
  if (_.isArray(obj)) {
    return [...state.slice(0, prevLoc + 1), ...obj, ...state.slice(prevLoc + 1)];
  }
  return [...state.slice(0, prevLoc + 1), obj, ...state.slice(prevLoc + 1)];
}

export function moveItem(state, source, target, after = true) {
  let source_loc = _.findIndex(state, ['id', source]);
  let target_loc = _.findIndex(state, ['id', target]);

  if (source_loc === -1 || target_loc === -1) {
    return state;
  }

  if (after) {
    if (source_loc > target_loc) {
      return [
        ...state.slice(0, target_loc + 1),
        state[source_loc],
        ...state.slice(target_loc + 1, source_loc),
        ...state.slice(source_loc + 1)
      ];
    }
    return [
      ...state.slice(0, source_loc),
      ...state.slice(source_loc + 1, target_loc + 1),
      state[source_loc],
      ...state.slice(target_loc + 1)];

  } else {
    if (source_loc < target_loc) {
      return [
        ...state.slice(0, source_loc),
        ...state.slice(source_loc + 1, target_loc),
        state[source_loc],
        ...state.slice(target_loc)
      ];
    }
    return [
      ...state.slice(0, target_loc),
      state[source_loc],
      ...state.slice(target_loc, source_loc),
      ...state.slice(source_loc + 1)
    ];
  }
}

export function duplicateNode(state, node) {
  if (_.isString(node)) {
    node = _.find(state, ['id', node]);
  }

  let children = _.filter(state, (o) => o.parent === node.id);
  let newId = uuidv4();

  return [
    Object.assign({}, node, {id: newId}),
    ..._(children)
      .map((o) => Object.assign({}, o, {parent: newId}))
      .map((o) => duplicateNode(state, o))
      .flatten()
      .value()
  ];
}

export function svgAddTable(svg, table) {
  svg = svg.cloneNode(true);
  table = table.cloneNode(true);

  let width = parseFloat(svg.getAttribute('width').replace(/pt$/i, ''));
  let height = parseFloat(svg.getAttribute('height').replace(/pt$/i, ''));

  let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  let html = document.createElementNS('http://www.w3.org/1999/xhtml', 'html');
  let head = document.createElementNS('http://www.w3.org/1999/xhtml', 'head');
  let style = document.createElementNS('http://www.w3.org/1999/xhtml', 'style');
  let body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');

  html.appendChild(head);
  head.appendChild(style);

  // foreignObject.setAttribute('requiredExtensions', "http://www.w3.org/1999/xhtml");
  foreignObject.setAttribute('width', '1000');
  foreignObject.setAttribute('height', height);
  foreignObject.setAttribute('x', width);
  foreignObject.setAttribute('y', '0');

  html.appendChild(body);
  body.appendChild(table);
  foreignObject.appendChild(html);

  svg.appendChild(foreignObject);
  svg.setAttribute('viewBox', `0 0 ${width + 1000} ${height}`);
  svg.removeAttribute('width');
  svg.removeAttribute('height');

  style.innerText += `table {border-collapse: collapse;max-width: 1000px;} table, th, td {border: 1px solid black;}`;

  return svg;
}
