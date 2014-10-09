/**
 * The 'handles' class defines a set of functions related to the user interface of layout creation and editing.
 *
 * @author		A. Tucovic <a.tucovic@fuzzybit.com>
 * @copyright	FuzzyBit Software Inc.
 */

function handles() {
	this.icons = new Array();
	this.icons[0] = icons[0];
	this.icons[1] = icons[1];
	this.icons[2] = icons[2];
	this.icons[3] = icons[3];
	this.icons[4] = icons[4];
	this.icons[5] = icons[5];
	this.icons[6] = icons[6];
	this.icons[7] = icons[7];
	this.icons[8] = icons[8];
	this.icons[9] = icons[9];

	this.protocol = protocol;
	// NOTE: TO BE REFACTORED OUT
	this.URI = host;

	return true;
}

/**
 * This method takes a base ID and references various handles of the overlay to add event listeners.
 */
handles.prototype.addEventListeners = function(id) {
	var node;
	for (var i in this.icons) {
		node = document.getElementById(id + this.icons[i]);
		if (node != null)
		{
			if (i == 4) // _resize
				node.addEventListener("mousedown", mouseDown, false);
			else if (i == 9) // _size
				node.addEventListener("mousedown", sizeDown, false);
			else if (i < 4)
				node.addEventListener("mousedown", insertNode, false);

			document.addEventListener("mouseup", mouseUp, false);
		}
	}

    node = document.getElementById(id + "_edit");
    if (node != null)
        node.addEventListener("click", editNode, false);

    node = document.getElementById(id + "_delete");
    if (node != null)
        node.addEventListener("click", deleteNode, false);

    node = document.getElementById(id + "_parent");
    if (node != null)
        node.addEventListener("click", parentNode, false);

    node = document.getElementById(id + "_save");
    if (node != null)
        node.addEventListener("click", saveLayout, false);
}

handles.prototype.addHandle = function(id, index) {
	var node = document.getElementById(id + "_overlay");
	var split = id.split("_");

	var handle = this.icons[index];
	var mode = handle.substr(1).replace("_", ".");

	var a = document.createElement("a");
	a.setAttribute("href", this.protocol + "://" + this.URI + "/mode/" + mode + "/node/" + split[1] + "." + split[2]);
	a.id = id + handle;
	a.style.position = "absolute";

    var src = this.protocol + "://" + this.URI + "/images/";
    handle = handle.replace("_", "");
	if (index >= 4)
		src += handle + ".gif";
	else
		src += "handle.gif";

	var img = document.createElement("img");
    img.setAttribute("src", src);
	img.setAttribute("alt", "handle");
	img.style.border = "0px";
	a.appendChild(img);
    a.onclick = function(){ return false; };

	node.appendChild(a);
}

handles.prototype.addHandlesByDivision = function(node) {
    this.removeHandles(node);

    var id = node.id.replace("_overlay", "");

	for (var i in this.icons) {
        if ((i == 5) || (i == 7)) { // _parent || _delete
            if (id != templateID[0])
                this.addHandle(id, i);
		} else if (i == 8) { // _save
			if (modified)
				this.addHandle(id, i);
        } else if (i == 9) { // _size
			if (id == templateID[0])
				this.addHandle(id, i);
		} else if (i != 4) { // _resize
			this.addHandle(id, i);
        }
	}

    var secondary = getSecondNode(node);
    if (secondary != null) {
        this.removeHandles(secondary);

        id = secondary.id.replace("_overlay", "");

        if (vector[0] == 1) {
            i = 0;
        } else if (vector[1] == 1) {
            i = 1;
        } else if (vector[0] == -1) {
            i = 2;
        } else if (vector[1] == -1) {
            i = 3;
        }

        this.addHandle(id, i);

        i = 4;

        this.addHandle(id, i);
    }
}

handles.prototype.addHandles = function(handle) {
	var split = handle.split("_");
	var index = parseInt(split[2]);

	var id = "id_" + myLayout.data[index].oid + "_" + myLayout.data[index].id;

	for (var i in this.icons) {
        if ((i == 5) || (i == 7)) { // _parent || _delete
            if (id != templateID[0])
                this.addHandle(id, i);
        } else if (i == 9) {
            if (id == templateID[0])
                this.addHandle(id, i);
		} else if (i != 4) { // _resize
			this.addHandle(id, i);
        }
	}

    index = 1 - index;

	id = "id_" + myLayout.data[index].oid + "_" + myLayout.data[index].id;

	switch (handle) {
		case "_h_0":
			i = 0;
			break;
		case "_h_1":
			i = 1;
			break;
		case "_v_0":
			i = 2;
			break;
		case "_v_1":
			i = 3;
			break;
	}

	this.addHandle(id, i);

	i = 4;

	this.addHandle(id, i);
}

handles.prototype.removeHandles = function(parent) {
    var id;
    var node;
	for (var i in icons) {
        id = parent.id.replace("_overlay", icons[i]);
		node = document.getElementById(id);

        try {
            if (node != null)
                node.parentNode.removeChild(node);
        } catch (error) {
            console.log(error.message);
        }
	}
}

handles.prototype.resetHandles = function(aLayout) {
    if (aLayout == null) {
        var node = document.getElementById(templateID[0] + "_overlay");

        aLayout = new layout();
        aLayout.generateArray(node);

        this.removeHandles(node);
    }

    if (aLayout.data[0] != null) {
        var id = "id_" + aLayout.data[0].oid + "_" + aLayout.data[0].id + "_overlay";
        var node = document.getElementById(id);

        this.removeHandles(node);
        this.resetHandles(aLayout.data[0]);

        if (aLayout.data[1] != null) {
            id = "id_" + aLayout.data[1].oid + "_" + aLayout.data[1].id + "_overlay";
            node = document.getElementById(id);

            this.removeHandles(node);
            this.resetHandles(aLayout.data[1]);
        }
    }
}

handles.prototype.setHandle = function(id, handle, top, left) {
	var node = document.getElementById(id + handle);
	if (node != null) {
		node.style.top = top + "px";
		node.style.left = left + "px";
	}
}

handles.prototype.setHandles = function(offset, init) {
	if (offset == null)
		offset = 10;

    var id = "id_" + myLayout.oid + "_" + myLayout.id;

    if (init || (myLayout.data[0] == null)) {
        var width = myLayout.width;
        var widthMidpoint = Math.round(width / 2) - offset;
        var height = myLayout.height;
        var heightMidpoint = Math.round(height / 2) - offset;
    } else {
        var index = 0;
        if ((vector[1] == 1) || (vector[1] == -1))
            index = 1;

        var id = "id_" + myLayout.data[index].oid + "_" + myLayout.data[index].id;

        var width = myLayout.data[index].width;
        var widthMidpoint = Math.round(width / 2) - offset;
        var height = myLayout.data[index].height;
        var heightMidpoint = Math.floor(height / 2) - offset;
    }

    this.setHandle(id, "_h_1", 0 - offset, widthMidpoint);
    this.setHandle(id, "_h_0", height - offset, widthMidpoint);
    this.setHandle(id, "_v_1", heightMidpoint, 0 - offset);
    this.setHandle(id, "_v_0", heightMidpoint, width - offset);

    this.setHandle(id, "_edit", height - 2 * (offset + 1) - 2, width - 2 * offset - 5);
    this.setHandle(id, "_parent", 6, 4);
    this.setHandle(id, "_delete", 6, width - 2 * offset - 6);
	this.setHandle(id, "_save", height - 2 * (offset + 1) - 4, 6);

	this.setHandle(id, "_size", height - offset, width - offset);

    index = 1 - index;

    if (myLayout.data[index] != null) {
        id = "id_" + myLayout.data[index].oid + "_" + myLayout.data[index].id;

        width = myLayout.data[index].width;
        widthMidpoint = Math.round(width / 2) - offset;
        height = myLayout.data[index].height;
        heightMidpoint = Math.round(height / 2) - offset;

        if (myLayout.data[index].orientation[0] == 1) {
            this.setHandle(id, "_h_1", 0 - offset, widthMidpoint);
            this.setHandle(id, "_resize", height - offset, widthMidpoint);
        } else if (myLayout.data[index].orientation[1] == 1) {
            this.setHandle(id, "_resize", 0 - offset, widthMidpoint);
            this.setHandle(id, "_h_0", height - offset, widthMidpoint);
        } else if (myLayout.data[index].orientation[0] == -1) {
            this.setHandle(id, "_v_1", heightMidpoint, 0 - offset);
            this.setHandle(id, "_resize", heightMidpoint, width - offset);
        } else if (myLayout.data[index].orientation[1] == -1) {
            this.setHandle(id, "_resize", heightMidpoint, 0 - offset);
            this.setHandle(id, "_v_0", heightMidpoint, width - offset);
        }
    }
}

handles.prototype.toggleHandle = function(id, visibility) {
	var node = document.getElementById(id);
	if (node != null)
		node.style.visibility = visibility;
}

handles.prototype.toggleHandleVisibility = function(id, visibility)
{
	for (var i in this.icons)
		this.toggleHandle(id + this.icons[i], visibility);

	var node = getSecondNode(document.getElementById(id));
	if (node != null) {
		this.toggleHandle(node.id + this.icons[0], visibility);
		this.toggleHandle(node.id + this.icons[4], visibility);
	}
}