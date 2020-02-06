/* eslint-disable no-param-reassign */
/* eslint-disable no-console */
const express = require('express');
const proxy = require('express-http-proxy');

const app = express();
const regex = /[w]{3}\d+/gm;

const selectProxyHost = ({ host, url, headers }) => {
  const requested = `${host}${url}`;
  let target = `${host}${url}`;

  console.log(`Chegando requisição para ${requested}`);

  let execution = regex.exec(requested);

  while (execution !== null) {
    if (execution.index === regex.lastIndex) {
      regex.lastIndex += 1;
    }

    target = execution.reduce((accumulator, match) => accumulator.replace(match, 'www'), `${host}${url}`);
    headers.ambiente = execution[execution.length - 1];
    execution = regex.exec(requested);
  }

  console.log(`Redirecionando requisição para ${target}`);

  return target;
};

app.use(proxy(selectProxyHost, {
  proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
    if (srcReq.headers.ambiente) {
      proxyReqOpts.headers.ambiente = srcReq.headers.ambiente;
    }

    return proxyReqOpts;
  },
}));

const server = app.listen(process.env.PORT || 3000, () => console.log(`Redirecionador HTTP sendo executado na porta ${server.address().port}`));
