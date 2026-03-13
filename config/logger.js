'use strict';

const { winston } = require('@strapi/logger');

module.exports = ({ env }) => {
  const transports = [
    new winston.transports.Console({
      level: 'debug',
    }),
  ];

  if (env('NODE_ENV') !== 'production') {
    transports.push(
      new winston.transports.File({
        level: 'info',
        filename: 'logs/strapi.log',
        maxsize: 10485760, // 10MB
        maxFiles: 5,
        tailable: true,
      })
    );
  }

  return {
    transports,
  };
};
