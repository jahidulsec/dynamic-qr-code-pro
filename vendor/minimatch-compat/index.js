// Legacy consumers call `require("minimatch")(...)` directly; v11 only exposes named exports.
const mm = require("minimatch-patched")

function minimatch(...args) {
  return mm.minimatch(...args)
}

// v11 no longer compiles globs to RegExp; legacy callers (eslint-plugin-import) only use `.test()`.
function makeRe(pattern, options = {}) {
  const matcher = new mm.Minimatch(pattern, options)
  return { test: (path) => matcher.match(path) }
}

module.exports = Object.assign(minimatch, mm, { makeRe, default: minimatch })
