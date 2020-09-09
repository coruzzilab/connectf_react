/**
 * @author zacharyjuang
 */

function count(ele) {
  return function (acc, i) {
    if (i === ele) {
      return acc + 1;
    }
    return acc;
  };
}

module.exports = function (source) {
  let toc = '# Table of Contents\n\n';

  for (let m of source.match(/^ *#+.+$/gm)) {
    let level = m.split('').reduce(count('#'), 0) - 1;
    let name = m.replace(/^ *#+/, '');
    let link = name.trim().toLowerCase().replace(/[^a-z -]+/g, '').replace(/ /g, '-');

    for (let i = 0; i < level; i++) {
      toc += '  ';
    }
    toc += `- [${name}](#${link})\n`;
  }

  return `<div class="row"><div class="col-3 overflow-auto" style="height: 95vh">\n\n${toc}</div>` +
    `<div class="col-9 overflow-auto" style="height: 95vh">\n\n${source}</div></div>`;
};
