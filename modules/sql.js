const Url = require("url");
const request = require('sync-request');
const utilities = require("./utils");

module.exports = {
	scan: function(url){
		const injectableVars = [];
		let urlObject = Url.parse(url, true);

		Object.keys(urlObject.query).forEach(function(varName){

			urlObject.query[varName] += "'";

			delete urlObject.search;

			const res = request('GET', urlObject.format());
			if (res.statusCode == 200) {
	  			if (res.getBody().toString().toLowerCase().indexOf("You have an error in your SQL syntax".toLowerCase()) > -1) {
					injectableVars.push(varName);
				}
				if (res.getBody().toString().toLowerCase().indexOf("Microsoft OLE DB Provider for ODBC Drivers".toLowerCase()) > -1) {
					injectableVars.push(varName);
				}
			} else if (res.statusCode == 500) {
				injectableVars.push(varName);
			}

			urlObject = Url.parse(url, true);
		});

		if (injectableVars.length == 0) {
			console.log(url + " - a Página está segura sem possíveis ataques de SQL Injection.");
		} else {
			console.log(url + " - a Página não está segura está sucessivo a ataques de SQL Injection nas variaveis: " + utilities.arrayToCommaSeparatedString(injectableVars));
		}
	}
}
