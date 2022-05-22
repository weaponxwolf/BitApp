/*
	Full Motion by TEMPLATED
	templated.co @templatedco
	Released for free under the Creative Commons Attribution 3.0 license (templated.co/license)
*/

(function($) {

	skel.breakpoints({
		xlarge:	'(max-width: 1680px)',
		large:	'(max-width: 1280px)',
		medium:	'(max-width: 980px)',
		small:	'(max-width: 736px)',
		xsmall:	'(max-width: 480px)'
	});

	$(function() {

		var $window = $(window),
			$body = $('body');

		// Disable animations/transitions until the page has loaded.
			$body.addClass('is-loading');

			$window.on('load', function() {
				window.setTimeout(function() {
					$body.removeClass('is-loading');
				}, 100);
			});

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Banner.
			var $banner = $('#banner');

			if ($banner.length > 0) {

				// IE fix.
					if (skel.vars.IEVersion < 12) {

						$window.on('resize', function() {

							var wh = $window.height() * 0.60,
								bh = $banner.height();

							$banner.css('height', 'auto');

							window.setTimeout(function() {

								if (bh < wh)
									$banner.css('height', wh + 'px');

							}, 0);

						});

						$window.on('load', function() {
							$window.triggerHandler('resize');
						});

					}

				// Video check.
					var video = $banner.data('video');

					if (video)
						$window.on('load.banner', function() {

							// Disable banner load event (so it doesn't fire again).
								$window.off('load.banner');

							// Append video if supported.
								if (!skel.vars.mobile
								&&	!skel.breakpoint('large').active
								&&	skel.vars.IEVersion > 9)
									$gif.append('<video autoplay loop><source src="' + video + '.mp4" type="video/mp4" /><source src="' + video + '.webm" type="video/webm" /></video>');

						});

				// More button.
					$banner.find('.more')
						.addClass('scrolly');

			}

		// Scrolly.
			$('.scrolly').scrolly();

		// Poptrox.
			$window.on('load', function() {

				var $thumbs = $('.thumbnails');

				if ($thumbs.length > 0)
					$thumbs.poptrox({
						onPopupClose: function() { $body.removeClass('is-covered'); },
						onPopupOpen: function() { $body.addClass('is-covered'); },
						baseZIndex: 10001,
						useBodyOverflow: false,
						overlayColor: '#222226',
						overlayOpacity: 0.75,
						popupLoaderText: '',
						fadeSpeed: 500,
						usePopupDefaultStyling: false,
						windowMargin: (skel.breakpoint('small').active ? 5 : 50)
					});

			});

		// Initial scroll.
			$window.on('load', function() {
				$window.trigger('scroll');
			});

	});

})(jQuery);

var Modal = (function() {
	var trigger = $qsa(".modal__trigger"); // what you click to activate the modal
	var modals = $qsa(".modal"); // the entire modal (takes up entire window)
	var modalsbg = $qsa(".modal__bg"); // the entire modal (takes up entire window)
	var content = $qsa(".modal__content"); // the inner content of the modal
	var closers = $qsa(".modal__close"); // an element used to close the modal
	var w = window;
	var isOpen = false;
	var contentDelay = 400; // duration after you click the button and wait for the content to show
	var len = trigger.length;

	// make it easier for yourself by not having to type as much to select an element
	function $qsa(el) {
		return document.querySelectorAll(el);
	}

	var getId = function(event) {
		event.preventDefault();
		var self = this;
		// get the value of the data-modal attribute from the button
		var modalId = self.dataset.modal;
		var len = modalId.length;
		// remove the '#' from the string
		var modalIdTrimmed = modalId.substring(1, len);
		// select the modal we want to activate
		var modal = document.getElementById(modalIdTrimmed);
		// execute function that creates the temporary expanding div
		makeDiv(self, modal);
	};

	var makeDiv = function(self, modal) {
		var fakediv = document.getElementById("modal__temp");

		/**
		 * if there isn't a 'fakediv', create one and append it to the button that was
		 * clicked. after that execute the function 'moveTrig' which handles the animations.
		 */

		if (fakediv === null) {
			var div = document.createElement("div");
			div.id = "modal__temp";
			self.appendChild(div);
			moveTrig(self, modal, div);
		}
	};

	var moveTrig = function(trig, modal, div) {
		var trigProps = trig.getBoundingClientRect();
		var m = modal;
		var mProps = m.querySelector(".modal__content").getBoundingClientRect();
		var transX, transY, scaleX, scaleY;
		var xc = w.innerWidth / 2;
		var yc = w.innerHeight / 2;

		// this class increases z-index value so the button goes overtop the other buttons
		trig.classList.add("modal__trigger--active");

		// these values are used for scale the temporary div to the same size as the modal
		scaleX = mProps.width / trigProps.width;
		scaleY = mProps.height / trigProps.height;

		scaleX = scaleX.toFixed(3); // round to 3 decimal places
		scaleY = scaleY.toFixed(3);

		// these values are used to move the button to the center of the window
		transX = Math.round(xc - trigProps.left - trigProps.width / 2);
		transY = Math.round(yc - trigProps.top - trigProps.height / 2);

		// if the modal is aligned to the top then move the button to the center-y of the modal instead of the window
		if (m.classList.contains("modal--align-top")) {
			transY = Math.round(
				mProps.height / 2 + mProps.top - trigProps.top - trigProps.height / 2
			);
		}

		// translate button to center of screen
		trig.style.transform = "translate(" + transX + "px, " + transY + "px)";
		trig.style.webkitTransform = "translate(" + transX + "px, " + transY + "px)";
		// expand temporary div to the same size as the modal
		div.style.transform = "scale(" + scaleX + "," + scaleY + ")";
		div.style.webkitTransform = "scale(" + scaleX + "," + scaleY + ")";

		window.setTimeout(function() {
			window.requestAnimationFrame(function() {
				open(m, div);
			});
		}, contentDelay);
	};

	var open = function(m, div) {
		if (!isOpen) {
			// select the content inside the modal
			var content = m.querySelector(".modal__content");
			// reveal the modal
			m.classList.add("modal--active");
			// reveal the modal content
			content.classList.add("modal__content--active");

			/**
			 * when the modal content is finished transitioning, fadeout the temporary
			 * expanding div so when the window resizes it isn't visible ( it doesn't
			 * move with the window).
			 */

			content.addEventListener("transitionend", hideDiv, false);

			isOpen = true;
		}

		function hideDiv() {
			// fadeout div so that it can't be seen when the window is resized
			div.style.opacity = "0";
			content.removeEventListener("transitionend", hideDiv, false);
		}
	};

	var close = function(event) {
		event.preventDefault();
		event.stopImmediatePropagation();

		var target = event.target;
		var div = document.getElementById("modal__temp");

		/**
		 * make sure the modal__bg or modal__close was clicked, we don't want to be able to click
		 * inside the modal and have it close.
		 */

		if (
			(isOpen && target.classList.contains("modal__bg")) ||
			target.classList.contains("modal__close")
		) {
			// make the hidden div visible again and remove the transforms so it scales back to its original size
			div.style.opacity = "1";
			div.removeAttribute("style");

			/**
			 * iterate through the modals and modal contents and triggers to remove their active classes.
			 * remove the inline css from the trigger to move it back into its original position.
			 */

			for (var i = 0; i < len; i++) {
				modals[i].classList.remove("modal--active");
				content[i].classList.remove("modal__content--active");
				trigger[i].style.transform = "none";
				trigger[i].style.webkitTransform = "none";
				trigger[i].classList.remove("modal__trigger--active");
			}

			// when the temporary div is opacity:1 again, we want to remove it from the dom
			div.addEventListener("transitionend", removeDiv, false);

			isOpen = false;
		}

		function removeDiv() {
			setTimeout(function() {
				window.requestAnimationFrame(function() {
					// remove the temp div from the dom with a slight delay so the animation looks good
					div.remove();
				});
			}, contentDelay - 50);
		}
	};

	var bindActions = function() {
		for (var i = 0; i < len; i++) {
			trigger[i].addEventListener("click", getId, false);
			closers[i].addEventListener("click", close, false);
			modalsbg[i].addEventListener("click", close, false);
		}
	};

	var init = function() {
		bindActions();
	};

	return {
		init: init
	};
})();

Modal.init();

// Get the image modal
var imodal = document.getElementsByClassName("myModal");

// Get the image and insert it inside the modal - use its "alt" text as a caption
var img = document.getElementsByClassName("image");
var modalImg = document.getElementsByClassName("img01");
var captionText = document.getElementsByClassName("caption");
img[0].onclick = function(){
    imodal[0].style.display = "block";
    modalImg[0].src = this.src;
    captionText[0].innerHTML = this.alt;
}
img[1].onclick = function(){
    imodal[1].style.display = "block";
    modalImg[1].src = this.src;
    captionText[1].innerHTML = this.alt;
}
img[2].onclick = function(){
    imodal[2].style.display = "block";
    modalImg[2].src = this.src;
    captionText[2].innerHTML = this.alt;
}
img[3].onclick = function(){
    imodal[3].style.display = "block";
    modalImg[3].src = this.src;
    captionText[3].innerHTML = this.alt;
}

// Get the <span> element that closes the modal
var spn = document.getElementsByClassName("iclose");

// When the user clicks on <span> (x), close the modal
spn[0].onclick = function() {
  imodal[0].style.display = "none";
}
spn[1].onclick = function() {
  imodal[1].style.display = "none";
}
spn[2].onclick = function() {
  imodal[2].style.display = "none";
}
spn[3].onclick = function() {
  imodal[3].style.display = "none";
}
