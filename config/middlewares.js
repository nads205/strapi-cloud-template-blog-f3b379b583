module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://students.plaincc.com', 'https://jolly-meadow-065c3c003-4.westeurope.6.azurestaticapps.net'],
          'media-src': ["'self'", 'data:', 'blob:'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      header: '*',
      origin: [
        'https://students.plaincc.com',
        'https://jolly-meadow-065c3c003-4.westeurope.6.azurestaticapps.net',
        'https://jolly-meadow-065c3c003-5.westeurope.6.azurestaticapps.net',
        'http://localhost:3000',
        'http://localhost:1337',
        process.env.SITE_URL 
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept']
    }
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];