Package.describe({
  name: 'asyncopatedsoul:angular-ui-tree',
  summary: "Wrap angular-ui-tree for angular-meteor",
  version: "0.0.1",
  git: "https://github.com/asyncopatedsoul/meteor-AngularUiTree.git"
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@0.9.0.1');
  api.use('mquandalle:bower@0.1.11', 'client');
  api.use('urigo:angular@0.4.5', 'client');
  api.use('mizzao:bootstrap-3@3.2.0_1', 'client');
  //api.use('momentjs:moment@2.0.0','client');

  api.use([
		'templating',
		'jquery',
    'less'
	], 'client')
	
	api.addFiles([
		'modal.html',
		'modal.js'
	], 'client')
  
  api.addFiles('bower.json', 'client');

	api.addFiles('lib/angular-ui-tree.min.css', 'client');
  api.addFiles('lib/angular-ui-tree.js', 'client');  
  api.addFiles('lib/ui-bootstrap-tpls-0.12.0.min.js', 'client'); 
  // api.addFiles('.meteor/local/bower/angular-ui-tree/dist/angular-ui-tree.min.css', 'client');
  // api.addFiles('.meteor/local/bower/angular-ui-tree/dist/angular-ui-tree.js', 'client');

  api.addFiles('lib/multiple-date-picker.less', 'client');
  api.addFiles('lib/multipleDatePicker.js', 'client');  

  // Client files.
  api.addFiles('init.js', 'client');

  api.export('Modal', 'client')

});

// Package.onTest(function(api) {
//   api.use('tinytest');
//   api.use('netanelgilad:text-angular');
//   api.addFiles('netanelgilad:text-angular-tests.js');
// });