/**
 * This is a class that processes a form prior to sending an ajax request.
 *
 * @author		A. Tucovic <a.tucovic@fuzzybit.com>
 * @copyright	FuzzyBit Software Inc.
 */

function fuzzybitForm() {
    this.patterns = [/clear/, /east/, /west/, /id_\d+_\d+/, /\/node\/\d+\.\d+/, /\/mode\/edit/];

    return true;
}

fuzzybitForm.prototype.scanForm = function(event) {
    eventStop(event);

    var currentTarget = event.currentTarget;
    var href = currentTarget.getAttribute("action");

    var mode = href.match(/\/mode\/edit/);
    var node = href.match(/\/node\/(\d+)\.(\d+)/);

	/** TO DO: make slight adjustment to the form submission and callback logic when URI is not 'xoo/sprite/' based **/
	/** Also need to fix callback function to call 'getRequestJSON()' only once. **/
    if ((mode == null) && (node == null))
        var callback = getRequestJSONSpecial;
    else if (mode != null)
        var callback = callback_function; // in 'constants.js'
    else if (node != null)
        var callback = eval("id_" + node[1] + "_" + node[2]);
	/** TO DO **/

    var childNodes = event.currentTarget.childNodes;

    var formFields = f.scan(childNodes);

    var datum = formFields.join("&");

    sendURIEncodedRequest(href, datum, callback);
}

fuzzybitForm.prototype.scan = function(nodes) {
    var formFields = [];

    for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];

        // COULD ALSO CHECK FOR 'node.nodeType == node.ELEMENT_NODE'
        if (node.tagName != null) {
            switch (node.tagName.toLowerCase()) {
                case "input":
					switch (node.getAttribute("type")) {
						case "checkbox":
							formFields[formFields.length] = node.getAttribute("name") + "=" + (node.checked ? "on" : "off");
							break;
						case "radio":
							if (node.checked)
								formFields[formFields.length] = node.getAttribute("name") + "=" + node.getAttribute("value");
							break;
						default:
							if (node.getAttribute("name") != null)
								formFields[formFields.length] = node.getAttribute("name") + "=" + node.value;
					}

                    switch (node.getAttribute("type")) {
                        case "button":
                            break;
                        case "checkbox":
                            break;
                        case "file":
                            break;
                        case "hidden":
                            break;
                        case "password":
                            break;
                        case "radio":
                            break;
                        case "reset":
                            break;
                        case "submit":
                            break;
                        case "text":
                            break;
                        case "color":
                            // HTML5
                            break;
                        case "date":
                            // HTML5
                            break;
                        case "datetime":
                            // HTML5
                            break;
                        case "datetime-local":
                            // HTML5
                            break;
                        case "email":
                            // HTML5
                            break;
                        case "image":
                            // HTML5
                            break;
                        case "month":
                            // HTML5
                            break;
                        case "number":
                            // HTML5
                            break;
                        case "range":
                            // HTML5
                            break;
                        case "search":
                            // HTML5
                            break;
                        case "tel":
                            // HTML5
                            break;
                        case "time":
                            // HTML5
                            break;
                        case "url":
                            // HTML5
                            break;
                        case "week":
                            // HTML5
                            break;
                    }

                    break;
                case "select":
                    break;
                case "textarea":
                    if (node.getAttribute("name") != null)
                        formFields[formFields.length] = node.getAttribute("name") + "=" + encodeURIComponent(node.value);

                    break;
                default:
                    formFields = formFields.concat(this.scan(node.childNodes));
            }
        }
    }

    return formFields;
}

var f = new fuzzybitForm();
    
window.onload = function() {
	if (document.getElementsByTagName) {
		var form = document.getElementsByTagName("form");
		for (var i = 0; i < form.length; i++)
            form[i].addEventListener("submit", f.scanForm, false);
	}
}