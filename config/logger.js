'use strict';

const { winston } = require('@strapi/logger');

module.exports = {
  transports: [
    new winston.transports.Console({
      level: 'debug',
    }),
    new winston.transports.File({
      level: 'info',
      filename: 'logs/strapi.log',
      maxsize: 10485760, // 10MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
};
