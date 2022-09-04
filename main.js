const Url = require("url");
const request = require('request');
const cheerio = require("cheerio");
const async = require("async");
const xss = require('./modules/xss');
const https = require('./modules/https');
const sql = require('./modules/sql');
const csrf = require('./modules/csrf');

const visited = [];
const maximumPages = 100;
console.log("Digite a URL:")
process.stdin.on('data', typedURL => {
	const entryUrl = Url.parse(typedURL.toString());
	console.log("Aguarde enquanto o robô consulta as páginas.")
	const queue = async.queue((url, next) => {
		if (Object.keys(visited).length >= maximumPages || visited[url])
			return next(null);

		const parsedURL = Url.parse(url, true);

		if (parsedURL.host == entryUrl.host) {
			request({ uri: parsedURL.format(), followRedirect: false }, (error, response, body) => {
		 			if (!error && response.statusCode == 200) {
						$ = cheerio.load(body.toString());
						const anchorTags = $("a");

						anchorTags.map(function(index, anchortag){
							let link = $(this).attr("href");
							link = Url.resolve(entryUrl.format(), link);
							queue.push(link);
						});

						const formTags = $("form");

						formTags.map(function(index, formtag){
							let action = $(this).attr("action");
							action = Url.resolve(entryUrl.format(), action);
							queue.push(action);
						});

						visited[parsedURL.format()] = true;
		 			}
		 			next(null);
			});
		} else {
			next(null);
		}
	}, 1);

	queue.push(entryUrl.format());
	queue.drain = () => {
		console.log('Aplicando os testes nas páginas encontradas.')
		for (var link in visited) {
			xss.scan(link);
			https.scan(link);
			sql.scan(link);
			csrf.scan(link);
		}
	};
})

// http://testphp.vulnweb.com/