const fs = require('fs-extra');
const path = require('path');
const moment = require('moment');
const yaml = require('js-yaml');
const crypto = require('crypto');

function hash(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

module.exports = function scanFile(filePath, root) {
  const directory = path.relative(root, path.dirname(filePath));
  const object = {
    path: path.join('/', directory, path.basename(filePath, '.md')),
    id: path.basename(filePath),
    directory,
  };

  if (path.extname(filePath) === '.md') {
    object.outputPath = object.id === 'index.md' ? `${object.path}.html` : path.join(object.path, 'index.html');
    return fs.readFile(filePath, 'utf-8')
      .then((file) => {
        const parsed = /^([\W\w]+?)\n---\n([\W\w]*)/g.exec(file);
        if (parsed && parsed[1]) {
          object.keys = yaml.safeLoad(parsed[1]);
          object.body = parsed[2];
        } else {
          throw new Error(`${filePath} is not a valid markdown file!`);
        }

        if (object.id.slice(-9) === '.draft.md' && object.keys.title) {
          object.keys.title += ' [DRAFT]';
        }

        object.hash = hash(file);
        object.keys.date = moment(
          object.keys.date,
          ['YYYY-M', 'YYYY-MM-DD'],
        ).unix() || object.keys.date;
        return object;
      });
  }
  object.outputPath = object.path;
  object.hash = object.id;
  return Promise.resolve(object);
};
