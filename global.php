<?php

	/**
	 * This is a bootstrap file for a MVC design pattern.
	 *
	 * @package	FuzzyBit XOO
	 */

	require_once("client/constants.php");
	require_once("$path/php5/logic/HTTPStatusCodes.php");

	if (!isset($_SERVER["HTTPS"]) && $_SERVER["SERVER_PORT"] != 443) {
		$code = 403;
		headerHTTPStatus($code);
	}

	require_once("$path/php5/Container.php");
	require_once("$path/php5/APICaller.php");
	require_once("$path/applications/models/IController.php");
	require_once("$path/applications/models/front.php");
	require_once("$path/applications/models/view.php");
	require_once("$path/applications/controllers/front/layout.php");
