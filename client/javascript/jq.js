/**
 * This is a simple UI feature that expands divisions of a XOO layout.
 *
 * @author		A. Tucovic <a.tucovic@fuzzybit.com>
 * @copyright	FuzzyBit Software Inc.
 */

$(document).ready(function() {
	function jqAnimate(ID) {
		$("#" + ID[0]).animate({width: ID[1], height: ID[2]})
		$("#" + ID[0] + "_overlay").animate({width: ID[1], height: ID[2]})
	}

	var width;
	var length;
	var templateLength = templateID.length;
	var ID = new Array();
	for (var i = 0; i < templateLength; i++) {
		width = $("#" + templateID[i]).width();
		height = $("#" + templateID[i]).height();

		ID[i] = new Array(templateID[i], width, height);

		$("div#" + templateID[i]).width(0);
		$("div#" + templateID[i]).height(0);
	}

	i = 0;
	window.setInterval(
		function() {
			if (i < templateLength)
				jqAnimate(ID[i++]);
		},
		200
	)
});