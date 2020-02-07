const express = require('express');
const proxy = require('express-http-proxy');
const app = express();
const regex = /[w][w][w][\d]*[\d]/gm;

let m;
let reqUrl;
let targetUrl

function selectProxyHost(req) {
  reqUrl = req.hostname + req.url;
  targetUrl = req.hostname + req.url;
  
  console.log("Chegando requisição para " + reqUrl);

  while ((m = regex.exec(reqUrl)) !== null) {
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }

    m.forEach((match, groupIndex) => {
      targetUrl = reqUrl.replace(match, "www");
    });
  }

  console.log("Redirecionando requisição para " + targetUrl);
  return targetUrl;
}

app.use((req, res, next) => {
  req.headers.ambiente = 'www3';
  res.set("ambiente", "www3");
  next();
}, proxy(selectProxyHost));

const port = process.env.port || 3000;

app.listen(port, () => console.log("http_redirect inicializado"));