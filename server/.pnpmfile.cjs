function readPackage(pkg) {
  if (pkg.name === 'puppeteer' || pkg.name === 'mongodb-memory-server') {
    pkg.scripts = pkg.scripts || {};
  }
  return pkg;
}

module.exports = {
  hooks: {
    readPackage,
  },
};
