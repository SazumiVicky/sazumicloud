const fs = require('fs');
const yaml = require('js-yaml');

exports.command = 'init';
exports.describe = 'create the directory structure';

exports.handler = function handler(argv) {
  // create the target directory
  fs.mkdirpSync(argv.path.target);

  // create the source directory
  fs.mkdirpSync(argv.path.source);

  // create the template directory
  fs.mkdirpSync(argv.path.template);

  // create .sazumicloud.yml, overwriting if necessary
  const conf = {
    target: argv.target,
    source: argv.source,
    template: argv.template,
  };

  fs.writeFileSync(argv.path.yaml, yaml.safeDump(conf));
};
