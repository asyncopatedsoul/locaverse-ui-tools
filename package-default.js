Package.describe({
  name: 'asyncopatedsoul:angular-ui-tree',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.addFiles('asyncopatedsoul:angular-ui-tree.js');
});

Package.onTest(function(api) {
  api.use('tinytest');
  api.use('asyncopatedsoul:angular-ui-tree');
  api.addFiles('asyncopatedsoul:angular-ui-tree-tests.js');
});
