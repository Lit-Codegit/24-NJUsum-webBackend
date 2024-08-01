import { MidwayConfig } from '@midwayjs/core';

export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1719990379385_8994',
  koa: {
    port: 7002,
  },
  webSocket: {},
  cors: {
    origin: "*"
  }
} as MidwayConfig;
