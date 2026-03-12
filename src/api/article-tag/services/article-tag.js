'use strict';

/**
 * article-tag service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::article-tag.article-tag');
