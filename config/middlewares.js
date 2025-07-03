module.exports = [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      header: '*',
      origin: [
        'https://students.plaincc.com',
        'http://localhost:3000',
        'https://blpdepuo.gensparkspace.com',
        'https://npoaosyd.gensparkspace.com',
        'https://slxvhrfi.gensparkspace.com',
        'https://jolly-meadow-065c3c003-4.westeurope.6.azurestaticapps.net'
      ]
    }
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  'strapi::security',
];
