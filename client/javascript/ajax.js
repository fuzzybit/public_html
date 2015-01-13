/**
 * These functions provide utility for ajax calls.
 *
 * @author		A. Tucovic <a.tucovic@fuzzybit.com>
 * @copyright	FuzzyBit Software Inc.
 */

var i;
var dom;
var blnFound;
var blnError;
var error = "Error Status: ";
var arrRequest = new Array();

/**
 * This function creates and returns an ajax request object.
 *
 * @return object
 */
function createRequest()
{
	var request = null;

	try
	{
		request = new XMLHttpRequest();
	}
	catch (trymicrosoft)
	{
		try
		{
			request = new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (othermicrosoft)
		{
			try
			{
				request = new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (failed)
			{
				request = null;
			}
		}
	}

	if (request == null)
	{
		alert("Error Creating Ajax Object");
	}
	else
	{
		return request;
	}
}

/**
 * This function initializes an ajax object request to GET.
 *
 * @param string	url
 * @param string	callback
 */
function sendGetRequest(url, callback)
{
	var dateTime = new Date().getTime();

	post = "dateTime=" + dateTime + "&" + post;
    
	var request = createRequest();

	var index = arrRequest.push(new Array(dateTime, request)) - 1;

	arrRequest[index][1].open("GET", url, true);
	arrRequest[index][1].onreadystatechange = callback;
	arrRequest[index][1].setRequestHeader("X-Requested-With", "XMLHttpRequest");
}

/**
 * This function initializes and prepares an ajax request object to POST.
 *
 * @param string	url
 * @param string	post
 * @param string	callback
 */
function sendRequest(url, post, callback)
{
	var dateTime = new Date().getTime();

	post = "dateTime=" + dateTime + "&" + post;
    
	var request = createRequest();

	var index = arrRequest.push(new Array(dateTime, request)) - 1;

	arrRequest[index][1].open("POST", url, true);
	arrRequest[index][1].onreadystatechange = callback;
	arrRequest[index][1].setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	arrRequest[index][1].setRequestHeader("X-Requested-With", "XMLHttpRequest");
	arrRequest[index][1].send(post);
}

/**
 * The same function as sendRequest() except the post string is URI encoded
 * within this function instead of being passed as a URI encoded argument.
 *
 * The ajax object will either POST or PATCH a request.
 *
 * @param string	url
 * @param string	post
 * @param string	callback
 * @param string	method
 */
function sendURIEncodedRequest(url, post, callback, method)
{
	if (typeof method === 'undefined')
		method = "POST";

    blnFound = false;

	if (document.getElementById("indicator") != null)
		document.getElementById("indicator").setAttribute("style", "visibility: visible;");

	var dateTime = new Date().getTime();

	if (method == "POST")
		post = "dateTime=" + dateTime + "&" + encodeURI(post);
	else if (method == "PATCH")
		url = url + "/dateTime/" + dateTime + "/" + post;

	var request = createRequest();

	var index = arrRequest.push(new Array(dateTime, request)) - 1;

	arrRequest[index][1].open(method, url, true);
	arrRequest[index][1].onreadystatechange = callback;
	arrRequest[index][1].setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	arrRequest[index][1].setRequestHeader("X-Requested-With", "XMLHttpRequest");

	if (method == "POST")
		arrRequest[index][1].send(post);
	else if (method == "PATCH")
		arrRequest[index][1].send();
}

/**
 * This function prepares a XML ajax request object.
 */
function getRequest()
{
	for (i in arrRequest)
	{
		if (arrRequest[i][1].readyState == 4)
		{
			if (arrRequest[i][1].status == 200)
			{
				var dom = arrRequest[i][1].responseXML;

				var dateTime = dom.getElementsByTagName("dateTime")[0].firstChild.nodeValue;

				blnFound = (dateTime == arrRequest[i][0]);

				if (blnFound) {
                    arrRequest.splice(i, 1);

					break;
                }
			}
			else if (arrRequest[i][1].status == 400)
			{
				blnError = (arrRequest[i][1].getResponseHeader("Status") == arrRequest[i][0]);

				if (blnError)
					break;
			}
		}
	}
}

/**
 * This function prepares a JSON ajax request object.
 */
function getRequestJSON() {
	for (i in arrRequest)
	{
		if (arrRequest[i][1].readyState == 4)
		{
			if (arrRequest[i][1].status == 200 || arrRequest[i][1].status == 201)
			{
                json = eval("(" + arrRequest[i][1].responseText + ")");

                var dateTime = json.dateTime;

				var errorMessage = json.errorMessage;

				blnFound = (dateTime == arrRequest[i][0]);

				if (blnFound) {
                    arrRequest.splice(i, 1);

					if (errorMessage != "")
						window.location = window.location.href.replace(/\/$/, "") + "/error/" + errorMessage;

					break;
                }
			}
			else if (arrRequest[i][1].status == 400)
			{
				blnError = (arrRequest[i][1].getResponseHeader("Status") == arrRequest[i][0]);
    
				if (blnError)
					break;
			}
		}
	}
}

/**
 * This function prepares a JSON ajax request object.
 * NOTE: Temporarily added function to provide ajax callback for front-end pages.
 */
function getRequestJSONSpecial() {
	for (i in arrRequest)
	{
		if (arrRequest[i][1].readyState == 4)
		{
			if (arrRequest[i][1].status == 200 || arrRequest[i][1].status == 201 || arrRequest[i][1].status == 409)
			{
                json = eval("(" + arrRequest[i][1].responseText + ")");

                var dateTime = json.dateTime;

				var error = json.error;

				blnFound = (dateTime == arrRequest[i][0]);

				if (blnFound) {
                    arrRequest.splice(i, 1);
/**
					if (error != null) {
						window.location = "?error=" + error.metadata.ID;
					} else {
						var node = json.data.metadata.node;

						if (node != null && node.match(/\d+\.\d+/))
							eval("id_" + node.replace(".", "_") + "()");
					}
**/
					break;
                }
			}
			else if (arrRequest[i][1].status == 400)
			{
				blnError = (arrRequest[i][1].getResponseHeader("Status") == arrRequest[i][0]);
    
				if (blnError)
					break;
			}
		}
	}
}


function turnOffIndicator()
{
	var indicator = document.getElementById("indicator");

	if (indicator != null)
		indicator.className = "off";
}

function turnOnIndicator()
{
	var indicator = document.getElementById("indicator");

	if (indicator != null)
		indicator.className = "on";
}