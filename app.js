const express = require('express');
const request = require("request-promise-native");
const bodyParser = require('body-parser');
const app = express();

const regex = /[w][w][w][\d]*[\d]/gm;
const img = ['.png', '.jpg', '.gif', '.ico'];

app.use(bodyParser.json({'limit': '50mb'}));
app.use(bodyParser.urlencoded({extended: false}));
app.disable('x-powered-by');

/**
 * Function that returns if the parameter path is a image request.
 * 
 * @param {path} string path from the URL of the request.
 * @return {boolean} return true if the path contains .png, .jpg, .gif or .ico, if not false.
 */
function isImageRequest(path) {
  let find = img.filter(m => {
    return path.indexOf(m) > -1;
  });

  return (find.length > 0);
}

async function selectProxyHost(req) {
  let m;
  let reqUrl;
  let targetUrl;

  reqUrl = req.hostname;
  targetUrl = req.hostname;
  
  console.log("hostname in: " + reqUrl);

  while ((m = regex.exec(reqUrl)) !== null) {
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }

    m.forEach(async (match, groupIndex) => {
      targetUrl = reqUrl.replace(match, "www");

      if (!req.headers.ambiente) {
        req.headers.ambiente = match;
      }
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
      headers: reqData.headers,
      method: reqData.method
    };

    options.headers['connection'] = 'Keep-Alive';

    //JSON
    if (options.headers['content-type'] && (options.headers['content-type'].indexOf('application/json') > -1)) {
      options.body = reqData.body;
      options.json = true;
    }

    //Imagens
    if (isImageRequest(reqData.path)) {
      options.encoding = null;
    }

    if (options.headers['accept-encoding']) {
      delete options.headers['accept-encoding'];
    }

    console.log('============================================================');
    console.log(options);
    console.log('============================================================');

    request(options)
    .then(response => {
      resolve(response);
    })
    .catch(error => {
      reject(error);
    });
  });
}

app.use(async (req, res) => {

  sendRequest(req)
  .then(response => {

    //CSS
    if (req.path.indexOf('.css') > -1) {
      res.set({'Content-Type': 'text/css; charset=UTF-8'});
    }

    //Imagens
    if (isImageRequest(req.path)) {
      res.set({'Accept-Ranges': 'bytes'});
      res.set({'Content-Type': 'image/png'});
    }

    //Fontes
    if (req.path.indexOf('.woff2') > -1) {
      res.set({'Accept-Ranges': 'bytes'});
      res.set({'Content-Type': 'font/woff2'});
    } else if (req.path.indexOf('.woff') > -1) {
      res.set({'Accept-Ranges': 'bytes'});
      res.set({'Content-Type': 'font/woff'});
    }

    if (req.path.indexOf('.ttf') > -1) {
      res.set({'Accept-Ranges': 'bytes'});
      res.set({'Content-Type': 'font/ttf'});
    }

    res.send(response);
  })
  .catch(error => {
    res.status(error.statusCode || 500).send(error.error);
    console.error(error.error);
  });
});

const port = process.env.port || 3000;

app.listen(port, () => console.log("http_redirect running"));