var apiUrls = ["http://uhunt.felix-halim.net",
			"https://icpcarchive.ecs.baylor.edu/uhunt",
			"http://projecteuler.net"];
var apiNameId = ["uva", "icpcla", "euler"];

function getSchoolData() {
	return Q.when($.ajax("json/schoolid.json"));
}

function getUserData() {
	return Q.when($.ajax("json/users.json"));
}

function getUserRanksUhunt(userInfos, serviceId) {
	var users = userInfos.users;
	var promiseArray = [];
	
	users.forEach(function(v, k) {
		if(!v.hasOwnProperty(apiNameId[serviceId])) {
			return;
		}
	
		var aPromise = 	Q.when($.ajax(apiUrls[serviceId] + "/api/uname2uid/" + v[apiNameId[serviceId]]));
		var aPromise2 = aPromise.then(function(userId) {
				// Get user rank
				return Q.when($.ajax(apiUrls[serviceId] + "/api/ranklist/" + userId + "/0/0", {"dataType": "json"}));
			})
			.then(function(rankInfo) {
				// Unbox result and replace name
				var rankUnbox = rankInfo[0];
				rankUnbox.name = v.name;
				rankUnbox.schoolId = v.schoolid;

				return rankUnbox;
			})
			.then(function(rankInfo) {
				// Get submissions to tally WA and PE
				return Q.when($.ajax(apiUrls[serviceId] + "/api/subs-user/" + rankInfo.userid, {"dataType": "json"}))
							.then(function(subInfo) {
								return [rankInfo, subInfo];
							});
			})
			.then(function(bundle) {
				var nWa = 0, nTle = 0;
				var rankInfo = bundle[0];
				var subInfo = bundle[1];

				// Count number of WA and TLE
				subInfo.subs.forEach(function(v, k) {
					switch(v[2]) {
						case 70:
							// WA
							nWa++;
							break;
						case 50:
							// TLE
							nTle++;
							break;
					}
				});

				rankInfo.wa = nWa;
				rankInfo.tle = nTle;

				// Return augmented rankInfo
				return rankInfo;
			});

			promiseArray.push(aPromise2);
		});
	
	return Q.all(promiseArray);
}

function getUserRanksEuler(userInfos) {
	var users = userInfos.users;
	var promiseArray = [];
	var errorFilter = function(v) {
		return !v.hasOwnProperty("error");
	};
	
	users.forEach(function(v, k) {
		if(!v.hasOwnProperty("euler")) {
			return;
		}
	
		var aPromise = Q.when($.ajax("euler_json.php?username=" + v.euler))
							.then(function(rankInfo) {
								// Filter results and add relevant data
								if(!rankInfo.hasOwnProperty("error")) {
									rankInfo.name = v.name;
									rankInfo.schoolId = v.schoolid;
								
									if(rankInfo.solved instanceof Object) {
										rankInfo.solved = 0;
									}
								}
								
								return rankInfo;
							});
		
		promiseArray.push(aPromise);
	});
	
	return Q.all(promiseArray);
}

function printToTable(rankInfos, schoolData, serviceId, aTBody_jq) {
	if(serviceId == 2) {
		printToTableEuler(rankInfos, schoolData, aTBody_jq);
		return;
	}
	
	// Get school infos
	var docFrag = document.createDocumentFragment();
	
	// Sort by rank
	rankInfos.sort(function(a, b) {
		return a.rank - b.rank;
	});
	
	rankInfos.forEach(function(v, k) {
		var colorSwatchSpan = document.createElement("span");
		var aRow = document.createElement("tr");
		var aRowCols = [];
		
		// Edit color switch
		colorSwatchSpan.style.backgroundColor = schoolData.schools[v.schoolId].color;
		colorSwatchSpan.className = "colorSwatch";
		
		for(var i = 0; i < 5; i++) {
			aRowCols.push(aRow.insertCell(-1));
		}
		
		aRowCols[0].innerHTML = k + 1;
		aRowCols[0].setAttribute("title", "Author's Rank: " + v.rank);
		aRowCols[0].className = "helpCursor";
		aRowCols[1].innerHTML = "<a href=\"" + apiUrls[serviceId] + "/id/" + v.userid + "\" target=\"_blank\">" + v.name + "</a>";
		aRowCols[1].setAttribute("title", "Username: " + v.username);
		aRowCols[1].className = "helpCursor";
		aRowCols[1].appendChild(colorSwatchSpan);
		aRowCols[2].innerHTML = v.ac;
		aRowCols[3].innerHTML = v.wa;
		aRowCols[4].innerHTML = v.tle;
		
		docFrag.appendChild(aRow);
	});
	
	aTBody_jq.append(docFrag);
}

function printToTableEuler(rankInfos, schoolData, aTBody_jq) {
	var docFrag = document.createDocumentFragment();
	
	// Sort by number of problems solved
	rankInfos.sort(function(a, b) {
		return b.solved - a.solved;
	});
	
	rankInfos.forEach(function(v, k) {
		var colorSwatchSpan = document.createElement("span");
		var aRow = document.createElement("tr");
		var aRowCols = [];
		
		// Edit color switch
		colorSwatchSpan.style.backgroundColor = schoolData.schools[v.schoolId].color;
		colorSwatchSpan.className = "colorSwatch";
		
		for(var i = 0; i < 3; i++) {
			aRowCols.push(aRow.insertCell(-1));
		}
		
		aRowCols[0].innerHTML = k + 1;
		aRowCols[1].innerHTML = v.name;
		aRowCols[1].setAttribute("title", "Username: " + v.username);
		aRowCols[1].className = "helpCursor";
		aRowCols[1].appendChild(colorSwatchSpan);
		aRowCols[2].innerHTML = v.solved;
		
		docFrag.appendChild(aRow);
	});
	
	aTBody_jq.append(docFrag);
}

function getRanklistDeferred(serviceId) {
	var userDataPromise = getUserData();
	
	switch(serviceId) {
		case 0:
		case 1:
			// uHunt for UVa/LA
			// Uses JSON
			return userDataPromise.then(function(userInfos) {
					return getUserRanksUhunt(userInfos, serviceId);
				})
				.then(null, console.error);
		case 2:
			// Project Euler
			// Uses XML
			return userDataPromise.then(getUserRanksEuler)
				.then(function(rankInfos) {
					return rankInfos.filter(function(v) {
						return !v.hasOwnProperty("error");
					});
				})
				.then(null, console.error);
	}
}