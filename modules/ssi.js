const Url = require("url");
const request = require('request');

module.exports = {
	scan: function (url) {

		const urlObject = Url.parse(url, true);
		Object.keys(urlObject.query).forEach(function (varName) {
			const tries = 5;
			const robots = "robots.txt";

			for (let i = 0; i < tries; i++) {

				urlObject.query[varName] = robots;

				delete urlObject.search;
				request({url: urlObject.format()}, function (err,httpResponse,body) {
					if (httpResponse.statusCode == 200) {
						if(body.toLowerCase().indexOf("example file".toLowerCase()) > -1){
							console.log(url + " - SSI 'show robots.txt' Module: seems to be vulnerable to SSI attacks on variable " + varName);
						}
					}
				});
				robots = '../' + robots;
			}

			urlObject = Url.parse(url, true);
		});
	}
}
