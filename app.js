const express = require('express');
const request = require("request-promise-native");
const bodyParser = require('body-parser');
const compression = require('compression');
const app = express();
const regex = /[w][w][w][\d]*[\d]/gm;

let m;
let reqUrl;
let targetUrl

async function selectProxyHost(req) {
  reqUrl = req.hostname;
  targetUrl = req.hostname;
  
  console.log("hostname in: " + reqUrl);

  while ((m = regex.exec(reqUrl)) !== null) {
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }

    m.forEach(async (match, groupIndex) => {
      targetUrl = reqUrl.replace(match, "www");
      req.headers.ambiente = match;
    });
  }

  console.log("hostname out: " + targetUrl);
  return targetUrl;
}

async function sendRequest(reqData) {
  return new Promise(async (resolve, reject) => {
    let url = await selectProxyHost(reqData);

    let options = {
      url: "https://" + url + reqData.url,
      method: reqData.method,
      headers: reqData.headers
    };

    if (options.headers['content-type'] && options.headers['content-type'] == 'application/json') {
      options.body = reqData.body;
      options.json = true;
    }

    request(options)
    .then((response) => {
      resolve(response);
    })
    .catch((error) => {
      reject(error);
    });
  });
}

app.set('view engine', 'pug');
app.use(compression({level: 6}));
app.use(bodyParser.json({'limit': '50mb'}));
app.use(bodyParser.urlencoded({extended: false}));

app.use(async (req, res) => {

  sendRequest(req)
  .then((response) => {
    console.log(response);
    res.send(response);
  })
  .catch((error) => {
    res.status(error.statusCode || 500).send(error.error);
  });
});

const port = process.env.port || 3000;

app.listen(port, () => console.log("http_redirect inicializado"));