const express = require('express');
const app = express();
const targetBaseUrl = 'http://www.letsboot.com/';

function handleRedirect(req, res) {
  const targetUrl = targetBaseUrl + req.originalUrl;
  res.redirect(targetUrl);
}

app.get('*', handleRedirect);

const port = process.env.port || 3000;

app.listen(port);