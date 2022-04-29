const fs = require('fs-extra');
const path = require('path');
const mathjax = require('mathjax-node-page').mjpage;

const defaultLocation = require.resolve('./default.liquid');

function renderFile(object, site, argv, conv) {
  const dirname = object.directory === '' ? '_root' : path.basename(object.directory);
  const layout = object.keys.layout || (object.id === 'index.md' ? 'index' : dirname);

  const head = {};
  Object.assign(head, argv.head);
  head.title = argv.titleTemplate.replace('$0', object.keys.title);
  Object.assign(head, object.keys.head);
  if (object.keys.keywords) {
    head.keywords = object.keys.keywords;
  }

  const params = {
    keys: object.keys,
    global: argv.global,
  };

  if (object.keys.regen) {
    params.site = site;
  }

  return conv.liquid.parseAndRender(object.body, params)
    .then(body => conv.markdown.makeHtml(body))
    .then((body) => {
      if (object.keys.math) {
        return new Promise((resolve) => {
          mathjax(body, { format: ['TeX'], singleDollars: true, output: 'html' }, {}, o => resolve(o));
        });
      }
      return body;
    })
    .then(html => conv.liquid.renderFile(defaultLocation, {
      keys: object.keys,
      directory: object.directory,
      html,
      layout,
      head
    }))
    .then(html => fs.outputFile(path.join(argv.path.target, object.outputPath), html))
    .catch(console.log);
}

module.exports = function render(base, site, argv, conv) {
  if (typeof base.body === 'string') {
    return renderFile(base, site, argv, conv);
  }

  return fs.copy(
    path.join(argv.path.source, base.path),
    path.join(argv.path.target, base.path),
  );
};
