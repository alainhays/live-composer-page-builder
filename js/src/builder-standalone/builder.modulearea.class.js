/**
 * DSLC_ModuleArea class
 */

'use strict';

LiveComposer.Builder.Elements.CModuleArea = function(elem) {

	/* Local vars. */
	var self = this,
	moduleAreaInnerContainer = null;

	/* Object properties */
	this.section = jQuery(elem).closest('.dslc-modules-section');
	this.elem = elem;

	/** Set observer to change elements class */

	this.observer = new mqMutationObserver(elem, function(){

		var classList = self.elem.classList;

		if (elem.querySelectorAll('.dslc-module-front').length == 0) {

			classList.add('dslc-modules-area-empty');
			classList.remove('dslc-modules-area-not-empty');
		} else {

			classList.remove('dslc-modules-area-empty');
			classList.add('dslc-modules-area-not-empty');
		}
	}, {childList: true});

	/**
	 * Make MODULES inside the Modules Area draggable/sortable
	 *
	 * this = <div class="dslc-modules-area....
	 */

	// New flexbox grid requires all the modules to sit in the .lc-row container.
	if ( elem.classList.contains('lc-row') ) {
		moduleAreaInnerContainer = elem;
	} else {
		moduleAreaInnerContainer = elem.querySelectorAll('.lc-row')[0];
	}

	// console.log( "elem:" ); console.log( elem );
	// console.log( "moduleAreaInnerContainer:" ); console.log( moduleAreaInnerContainer );


	// moduleAreaInnerContainer.sortable = Sortable.create(elem, {
	moduleAreaInnerContainer.sortable = Sortable.create(moduleAreaInnerContainer, {
		group: 'modules',
		animation: 150,
		handle: '.dslc-module-front', // .dslca-move-module-hook
		draggable: '.dslc-module-front',
		ghostClass: 'dslca-module-ghost', // - original module that stays in place
		chosenClass: 'dslca-module-dragging', // - both original and floating
		scroll: true, // or HTMLElement
		scrollSensitivity: 50, // px, how near the mouse must be to an edge to start scrolling.
		scrollSpeed: 15, // px

		setData: function (dataTransfer, dragEl) {

		  dataTransfer.setData( LiveComposer.Utils.msieversion() !== false ? 'Text' : 'text/html', dragEl.innerHTML);
		},

		// dragging started
		onStart: function (evt) {
			// console.log( 'onStart' );

			evt.oldIndex;  // element index within parent

			jQuery('body').removeClass('dslca-drag-not-in-progress').addClass('dslca-drag-in-progress');
			jQuery('body', document).removeClass('dslca-drag-not-in-progress').addClass('dslca-drag-in-progress');

			LCAPP( function(lcApp){
				// Update dragging status in the app state.
				lcApp.state.dragging = true;
			});

		},
		// dragging ended

		onEnd: function (evt) {

			if ( dslcDebug ) console.log( 'CModuleArea - Sortable - onEnd' );

			evt.oldIndex;  // element's old index within parent
			evt.newIndex;  // element's new index within parent

			evt.preventDefault();

			dslc_generate_code();

			// Init resizable.
			LiveComposer.Builder.UI.initResizableModules();

			jQuery('body').removeClass('dslca-drag-in-progress').addClass('dslca-drag-not-in-progress');
			jQuery('body', document).removeClass('dslca-drag-in-progress').addClass('dslca-drag-not-in-progress');


			LCAPP( function(lcApp){
				// Update dragging status in the app state.
				lcApp.state.dragging = false;
			});

		},

		// Element is dropped into the list from another list
		onAdd: function (evt) {

			var itemEl = evt.item;  // dragged HTMLElement
			evt.from;  // previous list

			// If container/column/modules area droped.
			if ( jQuery(itemEl).data('id') == 'DSLC_M_A' ) {

				dslc_modules_area_add( jQuery(self.section).find('.dslc-modules-section-wrapper .dslc-modules-section-inner > .lc-row') );
				itemEl.remove();
			}

			// + indexes from onEnd
			// evt.preventDefault();
			// evt.stopPropagation(); return false;
		},

		// Changed sorting within list
		onUpdate: function (evt) {
			var itemEl = evt.item;  // dragged HTMLElement
			// + indexes from onEnd
			// evt.preventDefault();
			// evt.stopPropagation(); return false;

			dslc_show_publish_button();
		},

		// Called by any change to the list (add / update / remove)
		onSort: function (evt) {
			// same properties as onUpdate
			// evt.preventDefault();
			// evt.stopPropagation(); return false;

		},

		// Element is removed from the list into another list
		onRemove: function (evt) {
		  // same properties as onUpdate
		},

		// Attempt to drag a filtered element
		onFilter: function (evt) {
			var itemEl = evt.item;  // HTMLElement receiving the `mousedown|tapstart` event.
		},

		// Event when you move an item in the list or between lists
		onMove: function (evt) {
			// console.log('onMove');
			// Example: http://jsbin.com/tuyafe/1/edit?js,output
			evt.dragged; // dragged HTMLElement
			evt.draggedRect; // TextRectangle {left, top, right и bottom}
			evt.related; // HTMLElement on which have guided
			evt.relatedRect; // TextRectangle
			// return false; — for cancel


			// Add here the function to update underlying class
			if ( jQuery('.dslc-modules-area-empty').find('.dslc-module-front').length > 0 ) {

				jQuery(this).removeClass('dslc-modules-area-empty').addClass('dslc-modules-area-not-empty');

				jQuery('.dslca-no-content:not(:visible)', this).show().css({
					'-webkit-animation-name' : 'dslcBounceIn',
					'-moz-animation-name' : 'dslcBounceIn',
					'animation-name' : 'dslcBounceIn',
					'animation-duration' : '0.6s',
					'-webkit-animation-duration' : '0.6s',
					padding : 0
				}).animate({ padding : '35px 0' }, 300, function(){

				});
			}
		}
	});

	// Mark module area as initialized
	jQuery( elem ).attr('data-jsinit', 'initialized');

	/** Sort option setter */
	jQuery(document).on('LC.sortableOff', function(){

		self.sortable && self.sortable.option && self.sortable.option('disabled', true);
	});

	jQuery(document).on('LC.sortableOn', function(){

		self.sortable && self.sortable.option && self.sortable.option('disabled', false);
	});
}