const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const packageJson = require(path.join(root, 'package.json'));

const moduleIds = [
  'src/cli.js',
  'src/iterm.js',
  'src/notify.js',
  'src/profiles.js',
  'src/tty.js'
];

function readModule(id) {
  return fs.readFileSync(path.join(root, id), 'utf8');
}

const modules = moduleIds
  .map((id) => {
    const source = readModule(id);
    return `${JSON.stringify(id)}: function(require, module, exports, __filename, __dirname) {\n${source}\n}`;
  })
  .join(',\n');

const output = `#!/usr/bin/env node
'use strict';

const __nodeRequire = require;
const __path = __nodeRequire('path');
const __modules = {
${modules},
"package.json": function(require, module) {
  module.exports = ${JSON.stringify({ version: packageJson.version }, null, 2)};
}
};
const __cache = {};

function __resolve(fromId, request) {
  if (request === '../package.json') return 'package.json';
  if (!request.startsWith('.')) return null;
  const base = __path.dirname(fromId);
  let resolved = __path.normalize(__path.join(base, request)).replace(/\\\\/g, '/');
  if (!resolved.endsWith('.js')) resolved += '.js';
  return resolved;
}

function __requireFrom(fromId, request) {
  const resolved = __resolve(fromId, request);
  if (!resolved) return __nodeRequire(request);
  return __require(resolved);
}

function __require(id) {
  if (__cache[id]) return __cache[id].exports;
  const factory = __modules[id];
  if (!factory) throw new Error('Bundled module not found: ' + id);
  const module = { exports: {} };
  __cache[id] = module;
  const localRequire = (request) => __requireFrom(id, request);
  factory(localRequire, module, module.exports, id, __path.dirname(id));
  return module.exports;
}

__require('src/cli.js').main(process.argv.slice(2)).catch((error) => {
  console.error(error && error.message ? error.message : String(error));
  process.exitCode = 1;
});
`;

fs.mkdirSync(distDir, { recursive: true });
fs.writeFileSync(path.join(distDir, 'devping.cjs'), output);
fs.chmodSync(path.join(distDir, 'devping.cjs'), 0o755);
