'use strict';

const HTTP = require('http');
const { WebClient } = require('@slack/client');
require('dotenv').config();

const ACCESS_JUDGE = new RegExp(`^${process.env.ACCESS_KEY}:(open|close)$`);

const CLIENT = new WebClient(process.env.TOKEN);

HTTP.createServer((req, res) => {
  if (req.url === '/' && req.method === 'POST') {
    let isPostDataSuccess = false;
    let keyANdValStr = '';

    req.on('data', keyAndVal => {
      keyANdValStr = keyAndVal.toString();
      if (keyANdValStr.match(ACCESS_JUDGE) === null) {
        return;
      }
      isPostDataSuccess = true;
    });

    req.on('end', () => {
      if (!isPostDataSuccess) {
        res.writeHead(421, { 'Content-Type': 'text/plain' });
        res.end('Misdirected Request');
        return;
      }

      const STATUS = keyANdValStr.split(':')[1];

      CLIENT.chat.postMessage({
        channel: process.env.CHANNEL,
        text: STATUS,
        username: 'door',
        icon_emoji: (STATUS === 'open') ? ':unlock:' : ':lock:'
      });

      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end(STATUS);
    });
  } else if (req.url === '/' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('hello');
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404');
  }
}).listen(3000, () => console.log('Server http://localhost:3000'));
