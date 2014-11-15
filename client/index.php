<?php

	/**
	 * This is a bootstrap file for a MVC design pattern.
	 *
	 * @package	FuzzyBit XOO
	 */

	if ((!isset($_SERVER["HTTPS"])) && $_SERVER["SERVER_PORT"] != 443) {
		header("HTTP/1.1 403 Forbidden");
		exit;
	}

	require_once("constants.php");

	require_once("$path/php5/Container.php");
	require_once("$path/php5/APICaller.php");
	require_once("$path/php5/logic/HTTPStatusCodes.php");

	require_once("$path/applications/models/IController.php");
	require_once("$path/applications/models/front.php");
	require_once("$path/applications/models/view.php");
	require_once("$path/applications/controllers/front/layout.php");

	$front = FrontController::getInstance();

	$front->route();

	ob_start("ob_gzhandler");

	echo $front->body;

	FrontController::destroy();