<?php

	/**
	 * This is a bootstrap file for a MVC design pattern.
	 *
	 * @package	FuzzyBit XOO
	 */

	if ((!isset($_SERVER["HTTPS"])) && ($_SERVER["SERVER_PORT"] != 443)) {
		header("HTTP/1.1 403 Forbidden");
		exit;
	}

	require_once("constants.php");

	// Required Files
	require_once("$path/php5/global.php");

	// Interfaces
	require_once("$path/applications/controllers/action/ILayoutNode.php");
	require_once("$path/applications/controllers/action/ILayoutView.php");
	require_once("$path/applications/models/IController.php");

	// Classes
	require_once("$path/applications/controllers/action/Layout.php");
	require_once("$path/applications/controllers/action/LayoutNode.php");
	require_once("$path/applications/controllers/action/LayoutView.php");
	require_once("$path/applications/controllers/front/api.php");
	require_once("$path/applications/models/front.php");

	session_start();

	$front = Container::controller();
	$front->route();

	ob_start("ob_gzhandler");

	echo $front->body;

	/**
	 * PHP session destroying code from `http://ca3.php.net/manual/en/function.session-destroy.php`.
	 */

	$_SESSION = array();

	if (ini_get("session.use_cookies")) {
		$params = session_get_cookie_params();

		setcookie(session_name(), '', time() - 42000, $params["path"], $params["domain"], $params["secure"], $params["httponly"]);
	}

	session_destroy();