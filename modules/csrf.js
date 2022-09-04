const Url = require("url");
const request = require('request');
module.exports = {
	scan: function (url) {

		const urlObject = Url.parse(url, true);

		request.get(urlObject.format() +  '/crossdomain.xml', function(err,httpResponse,body) {
			if (httpResponse.statusCode == 200) {
				console.log(url + " - Atenção, a Página não está segura está sucessivo a ataques de Cross-site Request Forgery (CSRF)");
			}
		});
	}
}
