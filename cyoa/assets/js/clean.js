(function() {
	"use strict";
	var	nodes=new Array(),
		walker=document.createTreeWalker(
			document,
			NodeFilter.SHOW_TEXT,
			{
				acceptNode: function(node) {
					return /^\s*$/.test(node.data)?
						NodeFilter.FILTER_ACCEPT:
						NodeFilter.FILTER_REJECT;
					}
				}
			);
	while(walker.nextNode()) {
		nodes.push(walker.currentNode);
		}
	for(var i=0; i<nodes.length; i++) {
		nodes[i].parentElement.removeChild(nodes[i]);
		}
	})();