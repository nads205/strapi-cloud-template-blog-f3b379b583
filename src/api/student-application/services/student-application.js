'use strict';

/**
 * student-application service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::student-application.student-application');
