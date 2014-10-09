/**
 * The 'layout' class defines the data structure of a layout for the purposes of layout creation and editing.
 *
 * @author		A. Tucovic <a.tucovic@fuzzybit.com>
 * @copyright	FuzzyBit Software Inc.
 */

function layout() {
	this.fuzzybit = 4;

	this.oid = "0";
	this.id = 0;
	this.width = 0;
	this.height = 0;
	this.orientation = [];
	this.data = [];
	this.ratios = {"antecedentNode": 0, "antecedent": 0, "cumulativeChange": 0};

    this.inverse = true;

	return true;
}

layout.prototype.distillLayoutSignature = function() {
    var result = "";

	if (this.data.length == 0) {
		result = "O";
	} else {
		if ((this.data[0].orientation[0] == 1) || (this.data[0].orientation[1] == 1))
			result = "H";
		else
			result = "V";

		if (this.data[0] != null) {
			result = result + this.data[0].distillLayoutSignature();

			if (this.data[1] != null)
				result = result + this.data[1].distillLayoutSignature();
		}
	}

    return result;
}

layout.prototype.distillLayoutDimensions = function() {
    var result = new Array();

	if (this.id == 1) {
		result = [this.width, this.height];
	} else {
		if (this.id % 2 == 0) {
			if ((this.orientation[0] == 1) || (this.orientation[1] == 1))
				result.push(this.height);
			else
				result.push(this.width);
		}
    }

	if (this.data[0] != null) {
		result = result.concat(this.data[0].distillLayoutDimensions());

		if (this.data[1] != null)
			result = result.concat(this.data[1].distillLayoutDimensions());
	}

    return result;
}

layout.prototype.generateArray = function(node, deep) {
	var split = node.id.split("_");

	this.oid = split[1];
	this.id = parseInt(split[2]);
	this.orientation = defineVector(node);
	this.width = node.offsetWidth;
	this.height = node.offsetHeight;

	var subLayout = hasLayout(node);
	if (subLayout != null)
	{
		this.data[0] = new layout();
        this.data[0].generateArray(subLayout);
	}
	else
	{
		var primary = getFirstNode(node);
		if (primary != null)
		{
			this.data[0] = new layout();
            this.data[0].generateArray(primary);

			this.data[1] = new layout();
            this.data[1].generateArray(getSecondNode(primary));

			var antecedentNode = 0;
			var antecedent = 0;	// ANTECEDENT:CONSEQUENT (RATIO)
			var cumulativeChange = 0;	// CUMULATIVE DELTA
			if ((this.orientation[0] == 1) || (this.orientation[1] == 1)) {
				if (this.data[0].height < this.data[1].height)
					antecedentNode = 1;

				if (this.data[1 - antecedentNode].height > 0)
					antecedent = Math.round(this.data[antecedentNode].height / this.data[1 - antecedentNode].height);
			} else if ((this.orientation[0] == -1) || (this.orientation[1] == -1)) {
				if (this.data[0].width < this.data[1].width)
					antecedentNode = 1;

				if (this.data[1 - antecedentNode].width > 0)
					antecedent = Math.round(this.data[antecedentNode].width / this.data[1 - antecedentNode].width);
			}
			this.ratios.antecedentNode = antecedentNode;
			this.ratios.antecedent = antecedent;
			this.ratios.cumulativeChange = cumulativeChange;
		}
	}
}

layout.prototype.adjustDivision = function(suffix) {
	if (suffix == null)
		suffix = "";

	var id = "id_" + this.oid + "_" + this.id + suffix; 
	var node = document.getElementById(id);

	node.style.height = this.height + "px";
	node.style.width = this.width + "px";
}

/**
 *
 */
layout.prototype.adjustArray = function(delta) {
	if (isNaN(delta) || (delta == 0) || (this.data[0] == null))
		return false;

    if (this.data[1] == null) {
        // PROPAGATE TO SINGLE NODE
        this.data[0].adjustArray(delta);

        this.data[0].adjustDivision();
        this.data[0].adjustDivision("_overlay");
    } else {
        var absoluteDelta = Math.abs(delta);

        var primaryDelta = 0;
        var secondaryDelta = 0;

        var disoriented = (vector.toString() != this.data[0].orientation.toString());
        if (this.data[1] != null)
            disoriented = disoriented && (vector.toString() != this.data[1].orientation.toString());

        if (disoriented) {
            primaryDelta = delta;
            secondaryDelta = delta;
        } else if (absoluteDelta == 1) {
            if (this.ratios.antecedentNode == 0) {
                if (Math.abs(this.ratios.cumulativeChange) < this.ratios.antecedent) {
                    primaryDelta = delta;
                    secondaryDelta = 0;

                    this.ratios.cumulativeChange += delta;
                } else {
                    primaryDelta = 0;
                    secondaryDelta = delta;

                    this.ratios.cumulativeChange = 0;
                }
            } else {
                if (Math.abs(this.ratios.cumulativeChange) < this.ratios.antecedent) {
                    primaryDelta = 0;
                    secondaryDelta = delta;

                    this.ratios.cumulativeChange += delta;
                } else {
                    primaryDelta = delta;
                    secondaryDelta = 0;

                    this.ratios.cumulativeChange = 0;
                }
            }
        } else if ((absoluteDelta > 1) && (absoluteDelta <= this.fuzzybit)) {
            var signDelta = delta / absoluteDelta;

            var result = this.fuzzify(absoluteDelta);

            if (this.ratios.antecedentNode == 0) {
                primaryDelta = signDelta * result[0];
                secondaryDelta = signDelta * result[1];
            } else {
                primaryDelta = signDelta * result[1];
                secondaryDelta = signDelta * result[0];
            }
        } else if (absoluteDelta > this.fuzzybit) {
            var signDelta = delta / absoluteDelta;

            var splitDelta = this.splitDelta(absoluteDelta);

            primaryDelta = signDelta * splitDelta[0];
            secondaryDelta = signDelta * splitDelta[1];
        }

        var antecedentNode;	// ANTECEDENT:CONSEQUENT (RATIO)
        var antecedent;
        if (disoriented) {
            if ((vector[0] == 1) || (vector[1] == 1)) {
                this.data[0].height += primaryDelta;
                if (this.data[1] != null)
                    this.data[1].height += secondaryDelta;
            } else if ((vector[0] == -1) || (vector[1] == -1)) {
                this.data[0].width += primaryDelta;
                if (this.data[1] != null)
                    this.data[1].width += secondaryDelta;
            }
        } else if ((vector[0] == 1) || (vector[1] == 1)) {
            this.data[0].height += primaryDelta;
            this.data[1].height += secondaryDelta;

            if (this.data[0].height >= this.data[1].height) {
                antecedentNode = 0;
                antecedent = Math.round(this.data[0].height / this.data[1].height);
            } else {
                antecedentNode = 1;
                antecedent = Math.round(this.data[1].height / this.data[0].height);
            }
        } else if ((vector[0] == -1) || (vector[1] == -1)) {
            this.data[0].width += primaryDelta;
            this.data[1].width += secondaryDelta;

            if (this.data[0].width >= this.data[1].width) {
                antecedentNode = 0;
                antecedent = Math.round(this.data[0].width / this.data[1].width);
            } else {
                antecedentNode = 1;
                antecedent = Math.round(this.data[1].width / this.data[0].width);
            }
        }

        this.ratios.antecedentNode = antecedentNode;
        this.ratios.antecedent = antecedent;

        this.data[0].adjustArray(primaryDelta);
        this.data[1].adjustArray(secondaryDelta);

        this.data[0].adjustDivision();
        this.data[1].adjustDivision();
        this.data[0].adjustDivision("_overlay");
        this.data[1].adjustDivision("_overlay");
    }
}

layout.prototype.splitDelta = function(delta) {
	var result = new Array();

	if ((vector[0] == 1) || (vector[1] == 1)) {
		result[0] = Math.round((1 + delta / this.height) * this.data[0].height) - this.data[0].height;
		result[1] = delta - result[0];
	} else if ((vector[0] == -1) || (vector[1] == -1)) {
		result[0] = Math.round((1 + delta / this.width) * this.data[0].width) - this.data[0].width;
		result[1] = delta - result[0];
	}

	return result;
}

/**
 * This function identifies the node ID to be deleted.
 * NOTE: Same/similar code to 'mouseMove()' (core.js); TO DO: Refactor
 *
 * @param	string id
 */
layout.prototype.deleteDivision = function(id) {
    var split = id.split("_");

    var targetId = id.replace("_delete", "");
	
	var delta;
	if ((vector[0] == 1) || (vector[1] == 1)) {
		if (vector[0] == 1)
			delta = this.data[0].height;
		else
			delta = -this.data[1].height;

		this.data[0].height -= delta;

        this.data[0].adjustDivision();
        this.data[0].adjustDivision("_overlay");

        if (this.data[1] != null) {
            this.data[1].height += delta;

            this.data[1].adjustDivision();
            this.data[1].adjustDivision("_overlay");
        }
	} else if ((vector[0] == -1) || (vector[1] == -1)) {
		if (vector[0] == -1)
			delta = this.data[0].width;
		else
			delta = -this.data[1].width;

		this.data[0].width -= delta;

        this.data[0].adjustDivision();
        this.data[0].adjustDivision("_overlay");

        if (this.data[1] != null) {
            this.data[1].width += delta;

            this.data[1].adjustDivision();
            this.data[1].adjustDivision("_overlay");
        }
	}

	this.data[0].adjustArray(-delta);
    if (this.data[1] != null)
        this.data[1].adjustArray(delta);

	this.deleteDOMDivision(targetId);
	this.deleteDOMDivision(targetId, "_overlay");
}

/**
 * This function removes a target node and its sibling,
 * and replaces the parent node's contents with the contents of the sibling.
 *
 * @param	string id
 */
layout.prototype.deleteDOMDivision = function(targetId, suffix) {
	if (suffix == null)
		suffix = "";

    var primaryNode = document.getElementById(targetId + suffix);
	var secondaryNode = getSecondNode(primaryNode);
	var parentNode = primaryNode.parentNode;

	var split = targetId.split("_");
	var bit = 1 - parseInt(split[2]) % 2;
	var handle = "_x_" + bit; // construct handle format
	var baseMask = this.getBaseMask(parentNode.id, handle);

	var style = window.getComputedStyle(secondaryNode);

	this.transplantDOMDivisions(secondaryNode.id, baseMask);

	var innerHTML = secondaryNode.innerHTML;

	this.transplantStyles(parentNode, style);

	parentNode.removeChild(primaryNode);
	parentNode.removeChild(secondaryNode);
	parentNode.innerHTML = innerHTML;
	
	prepareHandles(parentNode);
	prepareNodes(myLayout);
}

/**
 * This function will transplant the DOM node IDs associated with a binary tree following an edit.
 *
 * @param	string id
 */
layout.prototype.transplantDOMDivisions = function(id, baseMask) {
	var node = document.getElementById(id);
	
	var primaryNode = getFirstNode(node);
	if (primaryNode != null) {
		var secondaryNode = getSecondNode(primaryNode);
		
		var primaryStyle = window.getComputedStyle(primaryNode);
		var secondaryStyle = window.getComputedStyle(secondaryNode);

		this.transplantDOMDivisions(primaryNode.id, baseMask);		
		this.transplantDOMDivisions(secondaryNode.id, baseMask);
		
		// TRANSPLANTING NODE IDs RESETS THE STYLE REFERENCES
		
		var div = document.createElement("div");

		this.transplantStyles(div, primaryStyle);
		primaryNode.id = this.getTransplantId(primaryNode.id, baseMask, true);		
		primaryStyle = div.style;
		this.transplantStyles(primaryNode, primaryStyle);

		this.transplantStyles(div, secondaryStyle);
		secondaryNode.id = this.getTransplantId(secondaryNode.id, baseMask, true);
		secondaryStyle = div.style;
		this.transplantStyles(secondaryNode, secondaryStyle);
	}
}

layout.prototype.transplantStyles = function(node, styles) {
	var i;
	var length = styles.length;
	for (var i = 0; i < length; i++) {
		switch (styles[i]) {
			case "height":
			case "width":
				continue;
				break;
			case "background-color":
				node.style.setProperty(styles[i], styles.getPropertyValue(styles[i]), "");
		}
	}
}

layout.prototype.getLayoutDepth = function(id) {
    var split = id.split("_");
    var datum = parseInt(split[2]).toString(2);
    var length = datum.length;

    return length;
}

/**
 * This function takes a base ID and insertion handle value to determine a base mask.
 *
 * @param   string id
 * @param   string handle
 * @return  integer
 */
layout.prototype.getBaseMask = function(id, handle) {
    var split = handle.split("_");
    var bit = parseInt(split[2], 2);

    split = id.split("_");
    var datum = parseInt(split[2]);

    var mask = datum ^ ((datum << 1) | bit);

    return mask;
}

/**
 * This function takes an ID of a branch and calculates its new ID based on the base mask that is provided.
 *
 * @param   string id
 * @param   string baseMask
 * @param   string inverse
 * @return  string
 */
layout.prototype.getTransplantMask = function(id, baseMask, inverse) {
    if (inverse == null)
        offset = 1;
    else if (inverse === true)
        offset = 0;

    var baseLength = baseMask.toString(2).length - offset;

    var datum = parseInt(id);

    var length = datum.toString(2).length - baseLength;

    var i;
    for (i = 0; i < length; i++)
        baseMask = (baseMask << 1);

    var result = datum ^ baseMask;

    return result;
}

/**
 * This is a wrapper function for finding an ID for a transplanted branch.
 *
 * @param   string id
 * @param   string baseMask
 * @param   string inverse
 * @return  string
 */
layout.prototype.getTransplantId = function(id, baseMask, inverse) {
    var split = id.split("_");
    var datum = parseInt(split[2]);

    var result = this.getTransplantMask(datum, baseMask, inverse);

	result = split[0] + "_" + split[1] + "_" + result;
	if (split[3] != null)
		result += "_" + split[3];

    return result;
}

layout.prototype.shift = function(oid, index, baseMask) {
	if (this.data[index] != null) {
		if (this.data[index].oid == oid) {
            var id = this.data[index].id;

			this.data[index].id = this.getTransplantMask(id, baseMask);
			this.data[index].shiftId(baseMask);
		}
	}
}

layout.prototype.shiftId = function(baseMask) {
	this.shift(this.oid, 0, baseMask);
	this.shift(this.oid, 1, baseMask);
}

layout.prototype.shiftTemplate = function(index, baseMask) {
    if (this.data[index] != null) {
        var oid = myLayout.oid;
        if (this.data[index].oid == oid) {
            this.data[index].shiftTemplateId(baseMask);

            var id = "id_" + oid + "_" + this.data[index].id;

            var datum = templateID.indexOf(id);

            if (datum == -1)
                templateID[datum] = this.getTransplantId(id, baseMask);
        }
    }
}

layout.prototype.shiftTemplateId = function(baseMask) {
    this.shiftTemplate(0, baseMask);
    this.shiftTemplate(1, baseMask);
}

layout.prototype.insertDivision = function(handle) {
    var split = handle.split("_");
	var index = parseInt(split[2]);

    var data = [];

    if (this.data[0] != null)
        data.push(this.data[0]);

    if (this.data[1] != null)
        data.push(this.data[1]);

	this.data[1 - index] = new layout();
	this.data[1 - index].oid = this.oid;
    this.data[1 - index].id = ((this.id << 1) + 1 - index);

	this.data[index] = new layout();
	this.data[index].oid = this.oid;
    this.data[index].id = ((this.id << 1) + index);

	switch (handle) {
		case "_h_1":
		case "_h_0":
			this.data[1 - index].orientation = [index, 1 - index];
			this.data[index].orientation = [1 - index, index];

			this.data[1 - index].width = this.width;
			this.data[1 - index].height = 0;

			this.data[index].width = this.width;
			this.data[index].height = this.height;

			break;
		case "_v_1":
		case "_v_0":
			this.data[1 - index].orientation = [-index, -1 + index];
			this.data[index].orientation = [-1 + index, -index];

			this.data[1 - index].width = 0;
			this.data[1 - index].height = this.height;

			this.data[index].width = this.width;
			this.data[index].height = this.height;

			break;
	}

    if (data.length > 0) {
        var id = "id_" + this.oid + "_" + this.id;
        var baseMask = this.getBaseMask(id, handle);

        this.data[index].data = data;
        this.data[index].shiftId(baseMask);
        this.data[index].shiftTemplateId(baseMask);
    } else {
        data = this.data;
    }

    templateID.push("id_" + data[0].oid + "_" + data[0].id);
    templateID.push("id_" + data[1].oid + "_" + data[1].id);
}

layout.prototype.createDOMDivision = function(suffix, index) {
	var node = document.createElement("div");

    var data;
    if (index == null)
        data = this;
    else
        data = this.data[index];

	node.id = "id_" + data.oid + "_" + data.id + suffix;

	var className = "clear";
	if ((data.orientation[0] == -1) && (data.orientation[1] == 0))
		className = "west";
	else if ((data.orientation[0] == 0) && (data.orientation[1] == -1))
		className = "east";

	node.className = className;

	node.style.width = data.width + "px";
	node.style.height = data.height + "px";

	return node;
}

layout.prototype.insertLayoutDivision = function(handle, suffix, baseMask) {
    var split = handle.split("_");
    index = parseInt(split[2]);

    if (suffix != "_overlay")
        suffix = "";

    var parent = this.createDOMDivision(suffix);

    if ((this.data[0] == null) && (this.data[1] == null)) {
        if (suffix == "") {
            var id = this.getTransplantMask(this.id, baseMask, this.inverse);

            var datum = id.toString(2);
            var length = myLayout.id.toString(2).length;

            if (id == 0)
                id = 1;
            if (length < 1)
                length = 1;

            datum = datum.substring(0, length) + index + datum.substring(length);

            if (this.id == parseInt(datum, 2)) {
                var node = document.getElementById("id_" + this.oid + "_" + id);
                if (node != null)
                    parent.innerHTML = node.innerHTML;
            }
        }
    } else {
        var firstNode;
        if (this.data[index] != null)
            firstNode = this.data[index].insertLayoutDivision(handle, suffix, baseMask);

        var secondNode;
        if (this.data[1 - index] != null)
            secondNode = this.data[1 - index].insertLayoutDivision(handle, suffix, baseMask);

        if ((handle == "_h_1") || (handle == "_v_1")) {
            parent.appendChild(secondNode);
            parent.appendChild(firstNode);
        } else if ((handle == "_h_0") || (handle == "_v_0")) {
            parent.appendChild(firstNode);
            parent.appendChild(secondNode);
        }
    }

	if (suffix == "_overlay") {
		myHandles.removeHandles(parent);

		var sibling = getSecondNode(parent);
        if (sibling != null)
            myHandles.removeHandles(sibling);
    }

    return parent;
}

layout.prototype.insertDOMDivision = function(handle, suffix) {
	if (suffix != "_overlay")
		suffix = "";

	var split = handle.split("_");
	var index = parseInt(split[2]);

    vector = this.data[index].orientation;

	var id = "id_" + this.oid + "_" + this.id + suffix;

    var baseMask = this.getBaseMask(id, handle);

	var node = document.getElementById(id);

    var parent = this.insertLayoutDivision(handle, suffix, baseMask);
    parent.style.position = node.style.position;
    parent.style.top = node.style.top;

	node = node.parentNode.replaceChild(parent, node);

	if (suffix == "_overlay") {
        id = "id_" + this.oid + "_" + this.data[1 - index].id + suffix;
        var secondNode = document.getElementById(id);

        prepareDivision(secondNode);
        prepareNodes(myLayout);

        parent.style.background = node.style.background;
    }
}

// FUZZY RULE 0
layout.prototype.rule = function(x, x_0) {
	return (this.fuzzybit * this.fuzzybit - this.fuzzybit * (x + x_0) + 2 * x * x_0) / (this.fuzzybit * this.fuzzybit);
}

layout.prototype.defuzzify = function(v) {
	var value;
	var area = 0;
	var centroid = 0;
	var length = v.length;
	for (i = 0; i < length - 1; i++) {
		value = v[i][0] * v[i + 1][1] - v[i + 1][0] * v[i][1];
		area += value;
		centroid += (v[i][0] + v[i + 1][0]) * value;
	}
	area = area / 2;
	centroid = centroid / (6 * area);

	var result = new Array();
	result[0] = Math.round(centroid);
	result[1] = 0;

	return result;
}

layout.prototype.fuzzify = function(x) {
	var result;
	var i = 0;
	var vertices = new Array();
	vertices[i++] = [0, 0];
	if (x < this.fuzzybit)
		vertices[i++] = [0, this.rule(x, 0)];
	if (x > 0)
		vertices[i++] = [this.fuzzybit, this.rule(x, this.fuzzybit)];
	vertices[i++] = [this.fuzzybit, 0];

	result = this.defuzzify(vertices);

	if (result[0] == x)
		result[0] -= 1;
	result[1] = x - result[0];

	return result;
}