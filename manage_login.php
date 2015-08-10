<?php
	function isValidCookie($strCookie) {
		$verifyHash = NULL;
	
		if(!isset($strCookie->sessid) || !isset($strCookie->logind) || !isset($strCookie->user)) {
			return false;
		}
		
		// Find password hash
		$userAdmin = json_decode(file_get_contents("json/users_admin.json"));
		foreach($userAdmin as $eachUser) {
			if($eachUser->name == $strCookie->user) {
				$verifyHash = $strCookie->user . $strCookie->logind . $eachUser->pass;
				break;
			}
		}
		
		if(is_null($verifyHash)) {
			return false;
		}
		
		return hash("sha256", $verifyHash) == $strCookie->sessid;
	}
	
	function manageSession() {
		switch($_POST["t"]) {
			case "w":
				// Verify valid session cookie
				$userSessData = json_decode($_POST["s"]);
				
				if(isValidCookie($userSessData)) {
					// Write to session database
					$sessLogs = json_decode(file_get_contents("json/sessions.json"));
					$sessLogs[] = $userSessData;
					
					$fh = fopen("json/sessions.json", "w");
					fwrite($fh, json_encode($sessLogs, JSON_PRETTY_PRINT));
					fclose($fh);
					
					echo '{"sessid": "'.$userSessData->sessid.'"}';
				}
				else {
					// Invalid session cookie
					header("HTTP/1.1 403 Forbidden");
			
					echo '{"error": "Invalid session cookie"}';
				}
				
				break;
			case "r":
				// Remove to main session database
				$sessId = $_POST["sessid"];
				$sessLogs = json_decode(file_get_contents("json/sessions.json"));
				$sessKey = NULL;
				
				foreach($sessLogs as $k => $eachLog) {
					if($sessId == $eachLog->sessid) {
						$sessKey = $k;
						break;
					}
				}
				
				if(!is_null($sessKey)) {
					// Found session ID!
					$sessVal = array_splice($sessLogs, $sessKey, 1)[0];
				}
				
				$fh = fopen("json/sessions.json", "w+");
				fwrite($fh, json_encode($sessLogs, JSON_PRETTY_PRINT));
				fclose($fh);
				
				// Set/unset some variables
				unset($sessVal->sessid);
				$sessVal->logoutd = gmdate("D, d M Y H:i:s e");
				
				// Move removed data to user logs
				$userLogs = json_decode(file_get_contents("json/userlog.json"));
				$userLogs[] = $sessVal;
				
				$fh = fopen("json/userlog.json", "w");
				fwrite($fh, json_encode($userLogs, JSON_PRETTY_PRINT));
				fclose($fh);
				
				break;
		}
	}
	
	function receiveAjax() {
		// Set JSON header
		header("Content-Type: application/json; charset=UTF-8");
	
		if(!isset($_POST["f"]) || !isset($_POST["t"])) {
			header("HTTP/1.1 403 Forbidden");
			
			echo '{"error": "Missing required arguments."}';
			return;
		}
		
		switch($_POST["f"]) {
			case "sessions":
				manageSession();
				break;
		}
	}
	
	receiveAjax();
?>