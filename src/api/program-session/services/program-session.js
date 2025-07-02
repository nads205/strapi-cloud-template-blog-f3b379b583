'use strict';

/**
 * program-session service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::program-session.program-session');
