<?php
	function receiveAjax() {
		$fileName = "json/".$_GET["f"].".json";
		
		if(!file_exists($fileName)) {
			// File does not exist.
			echo "File ". $fileName ." does not exist";
			return;
		}
		
		echo "here!";
		
		$logs = json_decode(file_get_contents($fileName));
		$logs[] = json_decode($_GET["s"]);
		
		$fh = fopen($fileName, "w+");
		fwrite($fh, json_encode($logs, JSON_PRETTY_PRINT));
		fclose($fh);
	}
	
	receiveAjax();
?>