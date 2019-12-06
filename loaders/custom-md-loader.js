/**
 * @author zacharyjuang
 */
const marked = require("marked");

module.exports = function (markdown) {
  const renderer = new marked.Renderer();
  renderer.image = function(href, title, text) {
    if (href === null) {
      return text;
    }

    let out = `<img src="${href}" alt="${text}" class="tutorial-img shadow mx-auto d-block mb-2"`;
    if (title) {
      out += ` title="${title}"`;
    }
    out += '/>';

    return out;
  };

  marked.setOptions({
    renderer
  });

  return marked(markdown);
};
