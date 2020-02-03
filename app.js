const express = require('express');
const proxy = require('express-http-proxy');
const app = express();
const regex = /[w][w][w][\d]*[\d]/gm;

let m;
let reqUrl;
let targetUrl

function selectProxyHost(req) {
  reqUrl = req.host + req.url;
  targetUrl = req.host + req.url;

  while ((m = regex.exec(reqUrl)) !== null) {
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      targetUrl = reqUrl.replace(match, "www");
      req.headers.ambiente = match;
    });
  }

  return targetUrl;
}

app.use(proxy(selectProxyHost));

const port = process.env.port || 3000;

app.listen(port, () => console.log("http_redirect inicializado"));