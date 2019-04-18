'use strict';

import Timer from 'timer';
import Digital from 'pins/digital';
import Net from 'net';
import WiFi from 'wifi';
import { Request } from 'http';

const leadSwitch = new Digital(0, Digital.Input);

const ACCESS_KEY = 'da1b2bd33cea3a49';

let connected = false;

new WiFi({ ssid: 'WHITE SHOP', password: '' }, msg => {
  switch (msg) {
    case 'connect':
      break;
    case 'gotIP':
      trace(`IP address ${Net.get('IP')}\n`);
      connected = true;
      break;
    case 'disconnect':
      connected = false;
      break;
  }
});

let memo = leadSwitch.read();

const report = status => {
  trace(status + '\n');

  const REQUEST = new Request({	host: 'kit-dome-door-notify.glitch.me',
    path: '/',
    method: 'POST',
    body: `${ACCESS_KEY}:${status}`,
    response: String
  });

  REQUEST.callback = (msg, val) => {
    trace(msg + '\n');
    trace(val + '\n');
  };
};

Timer.repeat(() => {
  if (!connected) {
    return;
  }
  if (leadSwitch.read() === memo) {
    return;
  }

  memo = leadSwitch.read();

  if (memo === 1) {
    report('open');
  } else {
    report('close');
  }
}, 500);
