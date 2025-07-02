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
        'https://slxvhrfi.gensparkspace.com'
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