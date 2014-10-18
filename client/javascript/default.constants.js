/**
 * CONSTANTS
 *
 * @author		A. Tucovic <a.tucovic@fuzzybit.com>
 * @copyright	FuzzyBit Software Inc.
 */

/**
 * PROTOCOL
 */
var protocol = "https";

/**
 * HOST
 */
var host = "[HOST]";

/**
 * CLIENT
 */
var client = "[CLIENT PATH]";

/**
 * TO DO: These are constants that need to be factored out possibly by making ajax calls to the API.
 *
 * "/xoo/sprite/value/17/node/7904.1"
 * id_1045_1
 */

/**
 * REFERENCED BY core.js
 */
var signatureDimensionsURI = protocol + "://" + host + "/" + client + "/xoo/sprite/value/17/node/7904.1";

/**
 * REFERENCED BY js.js
 */
var callback_function;
window.onload = function() {
	callback_function = id_1045_1;
}