const Url = require("url");

module.exports = {
	scan: function (url) {
		let parsedURL = new URL(url);
		if (parsedURL.protocol === "http:") {
			console.log(url + " - Atenção, a Página não está segura, pois o protocolo HTTP não possuí um certificado de segurança.");
		}
	}
}
