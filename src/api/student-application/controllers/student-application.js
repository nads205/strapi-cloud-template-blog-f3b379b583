'use strict';

/**
 * student-application controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::student-application.student-application');
