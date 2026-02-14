'use strict';

/**
 * masseuse service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::masseuse.masseuse');
