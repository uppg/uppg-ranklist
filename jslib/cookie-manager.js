var CookieManager = {};

CookieManager.setCookieStr = function(ckey, cval, cdays) {
	var cookieStr = "";
	var myDate = new Date();
	
	myDate.setTime(myDate.getTime() + (cdays * 24 * 60 * 60 * 1000));
	
	return ckey + "=" + cval + "; expires=" + myDate.toUTCString();
};

CookieManager.getCookieStr = function(ckey, cookieStr) {
	var value = "; " + cookieStr;
	var parts = value.split("; " + name + "=");
	if (parts.length == 2) return parts.pop().split(";").shift();
};

CookieManager.deleteCookieStr = function(ckey) {
	return ckey + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
};