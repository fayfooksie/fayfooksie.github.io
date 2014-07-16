(function() {
	"use strict";
	var	options=document.getElementById("options");
	options.addEventListener("pick", function(event) {
		if(this.dataset.selected!==event.detail) {
			this.dataset.selected=event.detail;
			for(var i=0; i<this.children.length; i++) {
				if(i==event.detail) {
					this.children[i].className="selected";
					continue
					}
				this.children[i].className="";
				}
			}
		});
	window.addEventListener("keydown", function(event) {
		switch(event.keyCode) {
			case 38: //UP
			case 87: //W
				options.dispatchEvent(
					new CustomEvent("pick", {
						detail: options.dataset.selected>0?
							Number(options.dataset.selected)-1:
							options.children.length-1
						})
					);
				break;
			case 40: //DOWN
			case 83: //S
				options.dispatchEvent(
					new CustomEvent("pick", {
						detail: (Number(options.dataset.selected)+1)%options.children.length
						})
					);
				break;
			case 39: //RIGHT
			case 68: //D
			case 13: //ENTER
			case 32: //SPACE
				options.dispatchEvent(
					new CustomEvent("do", {
						detail: options.children[options.dataset.selected].textContent
						})
					);
				break;
			}
		});
	})();