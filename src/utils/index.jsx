/**
 * @author zacharyjuang
 * 6/18/18
 */
import _ from 'lodash';
import {v4 as uuidv4} from 'uuid';
import convert from "color-convert";

function brightness(r, g, b) {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export const colorShader = (cMin, cMax, log = true, neutral = 'f7f7f7') => {
  let minRGB = convert.hex.rgb(cMin);
  let maxRGB = convert.hex.rgb(cMax);

  return (val, min, max) => {
    if (log) {
      val = Math.log10(val);
    }

    if (val > max) {
      return {background: '#' + neutral, color: 'black'};
    } else {
      let scale = _.clamp(((val - min) / (max - min)), 0, 1);

      let scaledRGB = _(minRGB).zip(maxRGB)
        .map(([minC, maxC]) => {
          return minC + (maxC - minC) * scale;
        })
        .value();

      let background = '#' + convert.rgb.hex(scaledRGB);
      let color = brightness(...scaledRGB) < 0.5 ? 'white' : 'black';

      return {background, color};
    }

  };
};

export const redShader = _.partial(colorShader('b2182b', 'fddbc7'), _, _, Math.log10(0.5));

const clampExp = _.flow(_.partial(_.clamp, _, Number.MIN_VALUE, Number.MAX_VALUE), Math.log10);

export function getLogMinMax(data, cutoff = 0.05) {
  let res = _(data).flatten().filter(_.isNumber);

  return [clampExp(res.min()), Math.min(clampExp(res.max()), clampExp(cutoff))];
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
      if (/'/g.test(o.key)) {
        s += `"${o.key}"`;
      } else if (/\s/g.test(o.key) || /"/g.test(o.key)) {
        s += `'${o.key}'`;
      } else {
        s += o.key;
      }

      s += o.innerOper;

      if (/'/g.test(o.value)) {
        s += `"${o.value}"`;
      } else if (/\s/g.test(o.value) || /"/g.test(o.value)) {
        s += `'${o.value}'`;
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
  let tableHeight = table.getElementsByTagName('tr').length * 21;
  let totalHeight = Math.max(height, tableHeight);

  let foreignObject = document.createElementNS('http://www.w3.org/2000/svg', 'foreignObject');
  let html = document.createElementNS('http://www.w3.org/1999/xhtml', 'html');
  let head = document.createElementNS('http://www.w3.org/1999/xhtml', 'head');
  let style = document.createElementNS('http://www.w3.org/1999/xhtml', 'style');
  let body = document.createElementNS('http://www.w3.org/1999/xhtml', 'body');

  html.appendChild(head);
  head.appendChild(style);

  // foreignObject.setAttribute('requiredExtensions', "http://www.w3.org/1999/xhtml");
  foreignObject.setAttribute('width', '1000');
  foreignObject.setAttribute('height', totalHeight);
  foreignObject.setAttribute('x', width);
  foreignObject.setAttribute('y', '0');

  html.appendChild(body);
  body.appendChild(table);
  foreignObject.appendChild(html);

  svg.appendChild(foreignObject);
  svg.setAttribute('viewBox', `0 0 ${width + 1000} ${totalHeight}`);
  svg.removeAttribute('width');
  svg.removeAttribute('height');

  style.innerText += `table {border-collapse: collapse;max-width: 1000px;} table, th, td {border: 1px solid black;} body {margin: 0;} tr {height: 21px}`;

  return svg;
}

export function blobFromString(byteChars, type, chunkSize = 512) {
  let byteArrays = [];

  for (let offset = 0; offset < byteChars.length; offset += chunkSize) {
    let slice = byteChars.slice(offset, offset + chunkSize);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    let byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, {type});
}

export function columnString(n) {
  let s = '';
  while (n > 0) {
    let remainder = (n - 1) % 26;
    n = (n - 1) / 26 >> 0;
    s = String.fromCharCode(65 + remainder) + s;
  }

  return s;
}

export function buildNetworkJSON(data) {
  return {
    "format_version": "1.0",
    "generated_by": "ConnecTF",
    elements: {
      nodes: _.filter(data, ['group', 'nodes']),
      edges: _.filter(data, ['group', 'edges'])
    }
  };
}

export const networkJSONStringify = _.flow(
  buildNetworkJSON,
  JSON.stringify,
  _.partial(blobFromString, _, 'text/plain'),
  URL.createObjectURL
);

export function getColName(c, i = null) {
  let colStr;
  if (_.isNull(i)) {
    colStr = "";
  } else {
    colStr = columnString(i + 1) + '_';
  }

  return colStr + _.get(c, 'EXPERIMENTER', '') +
    _.get(c, 'DATE', '').replace('-', '') + '_' +
    _.get(c, 'TECHNOLOGY', '') + '_' + _.get(c, 'ANALYSIS_METHOD', '') + '_' +
    _.get(c, 'ANALYSIS_CUTOFF', '').replace(' ', '') + '_' +
    getGeneName(c);
}

export function getGeneName(data) {
  if (data['gene_name']) {
    return `${data['name']} (${data['gene_name']})`;
  }

  return data['name'];
}
