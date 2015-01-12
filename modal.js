var view = null;
var $modal = null;
var modalCallback;
var enabled = true;
var recompileAngular = true;

// The public API.
Modal = {
	
	show: function(templateName, data, callback, recompile){
		
		if (!enabled) return;
		enabled = false;

		var template = Template.peppelg_modal
		var data = {
			templateName: templateName,
			data: data
		}
		var parentNode = document.body
		
		view = Blaze.renderWithData(template, data, parentNode)
		
		if (callback) {
			modalCallback = callback;
		}

		if (typeof recompile != "undefined") {
			recompileAngular = recompile;
		}
	},
	
	hide: function(){
		//if (view!==null) return;
		console.log('hide modal manually');

		//if (modalCallback) modalCallback();
		$modal.modal('hide')
	}
	
}



// The modal template.
var templateName = 'peppelg_modal'

Template[templateName].rendered = function(){
	
	console.log('modal rendered');

	if (recompileAngular) {
	// Compile AngularJS directives inside modal HTML
	angular.element('.modal').injector().invoke(['$compile', '$document', '$rootScope',
          function ($compile, $document, $rootScope) {
            $compile(angular.element('.modal'))($rootScope);
            if (!$rootScope.$$phase) $rootScope.$apply();
          }
        ]);
	}



	$modal = $('.modal')
	
	$modal.modal()
	
	$modal.on('hidden.bs.modal', function(event){
		console.log('hide modal event');

		if (modalCallback) modalCallback();

		enabled = true;
		Blaze.remove(view);
		$modal = null;
		view = null;
	})
	
}