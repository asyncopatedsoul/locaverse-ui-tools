Meteor.startup(function() {
    if (typeof(ngMeteor) !== 'undefined') {
        angularMeteor.requires.push('ui.tree');
        angularMeteor.requires.push('ngTagsInput');
    }
});