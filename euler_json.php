<?php
function setHeaders() {
	header("Content-Type: application/json; charset=utf-8");
	header("Access-Control-Allow-Headers: X-Requested-With");
}

function receiveAjax() {
	setHeaders();

	if(!isset($_GET['username'])) {
		echo json_encode(array("error" => "No username specified."));
		return;
	}

	$xmlh = @simplexml_load_file("http://projecteuler.net/profile/".$_GET['username'].".xml");

	if(!$xmlh) {
		echo json_encode(array("error" => "Username does not exist."));
		return;
	}

	echo json_encode($xmlh);
}

receiveAjax();
?>
