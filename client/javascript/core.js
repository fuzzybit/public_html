/**
 * These functions prepare and coordinate the 'layout' and 'handle' class functions for layout creation and editing.
 *
 * @author		A. Tucovic <a.tucovic@fuzzybit.com>
 * @copyright	FuzzyBit Software Inc.
 */

var icons = new Array();
icons[0] = "_h_0";
icons[1] = "_h_1";
icons[2] = "_v_0";
icons[3] = "_v_1";
icons[4] = "_resize";
icons[5] = "_parent";
icons[6] = "_edit";
icons[7] = "_delete";
icons[8] = "_save";
icons[9] = "_size";

/**
 *
 */
var vector = new Array();

/**
 *
 */
var startPosition, startPositionX, startPositionY;

/**
 *
 */
var myLayout;

/**
 *
 */
var myHandles;

/**
 *
 */
var modified = false;

/**
 *
 */
var modifications = new Array();

/**
 * 
 */
function captureClick(event) {
	eventStop(event);
}

/**
 * 
 */
function defineVector(node) {
	var vector = new Array();
	var cssClass = node.getAttribute("class");
	if (cssClass == "clear") {
		if (isFirstNode(node)) {
			vector[0] = 1;
			vector[1] = 0;
		} else {
			vector[0] = 0;
			vector[1] = 1;
		}
	} else if ((cssClass == "east") || (cssClass == "west")) {
		if (isFirstNode(node)) {
			vector[0] = -1;
			vector[1] = 0;
		} else {
			vector[0] = 0;
			vector[1] = -1;
		}
	}

	return vector;
}

/**
 *
 */
function deleteNode(event) {
    eventStop(event);

    var id = event.currentTarget.id;

	var split = id.split("_");

	modifications.push(split[2] + ".x");

	modified = true;

    myLayout.deleteDivision(id);
}

/**
 *
 */
function domDivisionInsert(event) {
}

function domDivisionMouseMove(event) {
}

/**
 *
 */
function domDivisionMouseOut(event) {
	var target = event.currentTarget;
	target.style.opacity = "0.0";
}

/**
 *
 */
function domDivisionMouseOver(event) {
	var target = event.currentTarget;
	target.style.opacity = "0.6";
}

function domHandles(event) {
	eventStop(event);

	var primary = event.currentTarget;

    prepareDivision(primary);
}

function editNode(event) {
    eventStop(event);

    var id = event.currentTarget.parentNode.id;
    id = id.replace("id_", "");
    id = id.replace("_overlay", "");
    id = id.replace("_", ".");

    var href = window.location.href;
    href = href.replace(/\/$/, "");
    window.location.href = href + "/node/" + id;
}

function eventStop(event) {
	event.cancelBubble = true;
	event.returnValue = false;
	if (event.stopPropagation) {
		event.stopPropagation();
		event.preventDefault();
	}
}

/**
 * Given a node, this method will return its first binary child.
 *
 * @param	node node
 * @return	node
 */
function getFirstNode(node) {
	var datum = node.id.split("_");
	datum[2] = parseInt(datum[2]) << 1;

	return document.getElementById(datum.join("_"));
}

/**
 * Given a node, this method will return its parent node, or itself if it is the top-most node of a binary tree.
 *
 * @param	node node
 * @return	node
 */
function getParentNode(node) {
    var parent;

    var datum = node.id.split("_");

    if (parseInt(datum[2]) == 1)
        parent = node;
    else
        parent = node.parentNode;

    return parent;
}

/**
 * Given a node, this method will return its binary sibling.
 *
 * @param	node node
 * @return	node
 */
function getSecondNode(node) {
	if (node == null)
		return null;

	var datum = node.id.split("_");

    var result;
    if (parseInt(datum[2]) == 1) {
        result = null;
    } else {
        datum[2] = parseInt(datum[2]) ^ 1;
        datum[2] = datum[2].toString();

        result = document.getElementById(datum.join("_"));
    }

	return result;
}

function hasLayout(node)
{
	var datum;
	var childNode;

	var found = false;
	for (var i in templateOID)
	{
		datum = "id_" + templateOID[i] + "_1";
		childNode = document.getElementById(datum);

		if (childNode != null)
			found = (node == childNode.parentNode);

		if (found)
			break;
		else
			childNode = null;
	}

	return childNode;
}

/**
 * 
 */
function init() {
    var primary = document.getElementById(templateID[0]);

    prepareHandles(primary);
    prepareNodes(myLayout);
}

function insertNode(event) {
    eventStop(event);

    var currentTarget = event.currentTarget;

    var parent = currentTarget.parentNode;
    parent.removeEventListener("click", domHandles);
    parent.removeEventListener("mouseover", domDivisionMouseOver);
	parent.removeEventListener("mouseout", domDivisionMouseOut);

	var id = currentTarget.id;

	var i;
	var handle;
	var found = false;
	for (i in myHandles.icons) {
		found = (id.indexOf(myHandles.icons[i]) != -1);
		if (found) {
			var split = id.split("_");

			modifications.push(split[2] + "." + split[4]);

			modified = true;

			handle = myHandles.icons[i];
			id = id.replace(handle, "");

            myLayout = new layout();
            myLayout.generateArray(parent);
			myLayout.insertDivision(handle);
			myLayout.insertDOMDivision(handle);
			myLayout.insertDOMDivision(handle, "_overlay");

			break;
		}
	}

    mouseDown(event);
}

function isFirstNode(node) {
	var split = node.id.split("_");
    var datum = parseInt(split[2]);
	var result = ((datum == 1) || (datum % 2 == 0));

	return result;
}

function mouseDown(event) {
    eventStop(event);

	if (!event)
		var event = window.event;

	if ((vector[0] == 1) || (vector[1] == 1)) {
		if (event.pageY)
			startPosition = event.pageY;
		else if (event.clientY)
			startPosition = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	} else if ((vector[0] == -1) || (vector[1] == -1)) {
		if (event.pageX)
			startPosition = event.pageX;
		else if (event.clientX)
			startPosition = event.clientX;
	}

	document.addEventListener("mousemove", mouseMove, false);
}

/**
 * This event handler adjusts divisions by the resize delta.
 * NOTE: Same/similar code to 'layout.prototype.deleteDivision()'.
 *
 * TO DO: Refactor
 *
 * @param	event event
 */
function mouseMove(event) {
    eventStop(event);

	var currentPosition;
	if ((vector[0] == 1) || (vector[1] == 1)) {
		if (event.pageY)
			currentPosition = event.pageY;
		else if (event.clientY)
			currentPosition = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	} else if ((vector[0] == -1) || (vector[1] == -1)) {
		if (event.pageX)
			currentPosition = event.pageX;
		else if (event.clientX)
			currentPosition = event.clientX;
	}

	if (isNaN(currentPosition))
		return false;

	if (!modified)
		modified = !modified;

	var delta = startPosition - currentPosition;
	startPosition = currentPosition;

	if ((vector[0] == 1) || (vector[1] == 1)) {
        if ((myLayout.data[0].height - delta < 0) || (myLayout.data[0].height - delta > myLayout.height))
            return false;

		myLayout.data[0].height -= delta;

        myLayout.data[0].adjustDivision();
        myLayout.data[0].adjustDivision("_overlay");

        if (myLayout.data[1] != null) {
            myLayout.data[1].height += delta;

            myLayout.data[1].adjustDivision();
            myLayout.data[1].adjustDivision("_overlay");
        }
	} else if ((vector[0] == -1) || (vector[1] == -1)) {
        if ((myLayout.data[0].width - delta < 0) || (myLayout.data[0].width - delta > myLayout.width))
            return false;

		myLayout.data[0].width -= delta;

        myLayout.data[0].adjustDivision();
        myLayout.data[0].adjustDivision("_overlay");

        if (myLayout.data[1] != null) {
            myLayout.data[1].width += delta;

            myLayout.data[1].adjustDivision();
            myLayout.data[1].adjustDivision("_overlay");
        }
    }

	myLayout.data[0].adjustArray(-delta);
    if (myLayout.data[1] != null)
        myLayout.data[1].adjustArray(delta);
    myHandles.setHandles();
}

function mouseUp(event) {
    eventStop(event);

	document.removeEventListener("mousemove", mouseMove, false);
	document.removeEventListener("mouseup", mouseUp, false);
	document.removeEventListener("mousemove", sizeMove, false);
}

function sizeDown(event) {
	eventStop(event);

	if (!event)
		var event = window.event;

	if (event.pageX)
		startPositionX = event.pageX;
	else if (event.clientX)
		startPositionX = event.clientX;

	if (event.pageY)
		startPositionY = event.pageY;
	else if (event.clientY)
		startPositionY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

	document.addEventListener("mousemove", sizeMove, false);
}

function sizeMove(event) {
	eventStop(event);

	var currentPositionX;
	var currentPositionY;

	if (event.pageX)
		currentPositionX = event.pageX;
	else if (event.clientX)
		currentPositionX = event.clientX;

	if (event.pageY)
		currentPositionY = event.pageY;
	else if (event.clientY)
		currentPositionY = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;

	if (isNaN(currentPositionX) || isNaN(currentPositionY))
		return false;

	if (!modified)
		modified = !modified;

	var deltaX = startPositionX - currentPositionX;
	startPositionX = currentPositionX;

	var deltaY = startPositionY - currentPositionY;
	startPositionY = currentPositionY;

	if ((myLayout.height - deltaY <= 0) || (myLayout.width - deltaX <= 0))
		return false;

	myLayout.height -= deltaY;
	myLayout.width -= deltaX;

	myLayout.adjustArray(-deltaY);

	vector = [-1, 0];

	var orientation = myLayout.orientation;	
	myLayout.orientation = [-1, 0];

	myLayout.adjustArray(-deltaX);
	myLayout.adjustDivision();
	myLayout.adjustDivision("_overlay");

	vector = [1, 0];

	myLayout.orientation = orientation;
		
	var id = "id_" + myLayout.oid + "_" + myLayout.id + "_overlay"; 
	var node = document.getElementById(id);
	node.style.top = -myLayout.height + "px";

    myHandles.setHandles(null, true);
}

/**
 *
 */
function saveLayout() {
	if (!modified)
		return false;

	var thisNode = document.getElementById(templateID[0]);

	var thisLayout = new layout();
	thisLayout.generateArray(thisNode);

	var URI = window.location.href;

	var signature = thisLayout.distillLayoutSignature();

	var dimensions = thisLayout.distillLayoutDimensions();
	dimensions = dimensions.join(",");

	var edits = modifications.join(",");

	var pattern = /tokenID=([a-zA-Z0-9]*)/g;
	var token = pattern.exec(document.cookie);

	URI = URI.replace(/\./g, '%2E');
	URI = URI.replace(/\//g, '%2F');
	URI = URI.replace(/:/g, '%3A');

	var datum = "URI/" + encodeURIComponent(URI) + "/signature/" + signature + "/dimensions/" + dimensions + "/edits/" + edits + "/token/PageURI." + token[1] + "/";

	sendURIEncodedRequest(signatureDimensionsURI, datum, layoutSaved, "PATCH");
}

/**
 *
 */
function layoutSaved() {
	getRequestJSON();

	if (blnFound) {
		modified = false;
		modifications = new Array();

		console.log(json.result);
	}
}

function parentNode(event) {
    eventStop(event);

    var target = event.currentTarget.parentNode;

    myHandles.removeHandles(target);
    myHandles.removeHandles(getSecondNode(target));

    var parent = getParentNode(target);

    prepareDivision(parent);
}

function prepareDivision(primary) {
    prepareHandles(primary);

    myHandles.addHandlesByDivision(primary);
    myHandles.addEventListeners(primary.id.replace("_overlay", ""));

    var secondary = getSecondNode(primary);
    if (secondary != null)
        myHandles.addEventListeners(secondary.id.replace("_overlay", ""));

    var init = (primary.id.replace("_overlay", "") == templateID[0]);

    myHandles.setHandles(null, init);
}

function prepareHandles(primary) {
	vector = defineVector(primary);

    var node;
    if (primary.id == templateID[0]) {
        node = primary;
    } else {
        var split = primary.id.split("_");

        if (split[2] == "1")
            node = primary;
        else
            node = primary.parentNode;
    }

	myLayout = new layout();
    myLayout.generateArray(node);

	var id = node.id.replace("_overlay", "");

	myHandles = new handles();
    myHandles.resetHandles();
	myHandles.addEventListeners(id);

	var secondary = getSecondNode(primary);
	if (secondary != null)
	{
		id = secondary.id.replace("_overlay", "");
		myHandles.addEventListeners(id);
	}
}

function prepareNodes(myLayout) {
    if (myLayout.data[0] == null) {
        var division = document.getElementById("id_" + myLayout.oid + "_" + myLayout.id + "_overlay");
		if (division != null)
		{
			division.addEventListener("click", domHandles, false);
			division.addEventListener("mouseover", domDivisionMouseOver, false);
			division.addEventListener("mouseout", domDivisionMouseOut, false);
		}
    } else {
        prepareNodes(myLayout.data[0]);

        if (myLayout.data[1] != null)
            prepareNodes(myLayout.data[1]);
    }
}

var patterns = [/\/mode\/edit/gi, /\/node\/\d+\.\d+/gi];
var href = window.location.href;
if (patterns[0].test(href) && !patterns[1].test(href))
    window.addEventListener("load", init, false);