const Url = require("url");
const request = require('request');
const cheerio = require("cheerio");

module.exports = {
	scan: function (url) {
		const injectableForms = [];

		const urlObject = Url.parse(url, true);

		request.get(urlObject.format(), function(err,httpResponse,body) {
			let $;
			if (httpResponse.statusCode == 200) {
				$ = cheerio.load(body);
				const forms = $("form");

				forms.map(function (index, form) {
					const action = $(this).attr("action");
					const method = $(this).attr("method") || "GET";
					const inputs = $(this).children(":input");
					const actionUrlObject = Url.resolve(urlObject.format(), action);

					const inputsArray = inputs.toArray();

					inputsArray.map(function(index, testingInput) {
						const testingInputName = $(inputsArray[testingInput]).attr("name");

						const javaScript = "<script type='text/javascript'>alert('xss test');</script>";
						const form = {};

						for (let input in inputsArray) {
							let inject = $(inputsArray[input]).attr("name") == testingInputName;
							form[$(inputsArray[input]).attr("name")] = (inject ? javaScript : ($(inputsArray[input]).val() == "" || $(inputsArray[input]).val() == undefined ? "default" : $(inputsArray[input]).val()));
						}
						if (method == "GET") {
							let actionWithQuery = actionUrlObject + "?" + require('querystring').stringify(form);
							request({ url: actionWithQuery }, (err,httpResponse,body) => {
								if (body.toLowerCase().indexOf("<script type='text/javascript'>alert('xss test');</script>".toLowerCase()) > -1){
									console.log(url + " - Atenção, o Input com o nome " + testingInputName + " é vulnerável a XSS Injection");
								}
								if (httpResponse.statusCode > 307) {
									console.log(url + " - Atenção, o teste do Input com o nome " + testingInputName + " causou um error com status " + httpResponse.statusCode + " no servidor");
								}
							});
						} else {
							request.post({url: actionUrlObject, form: form}, (err,httpResponse,body) => {
								if (body.toLowerCase().indexOf("<script type='text/javascript'>alert('xss test');</script>".toLowerCase()) > -1) {
									console.log(url + " - Atenção, o Input com o nome " + testingInputName + " é vulnerável a XSS Injection");
								}
								if (httpResponse.statusCode > 307) {
									console.log(url + " - Atenção, o teste do Input com o nome " + testingInputName + " causou um error com status " + httpResponse.statusCode + " no servidor");
								}
							});
						}
					});
				});
			}
		});
	}
}
