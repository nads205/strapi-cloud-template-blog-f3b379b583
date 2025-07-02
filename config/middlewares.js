module.exports = [
  'strapi::errors',
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      header: '*',
      origin: [
        'https://students.plaincc.com',        // Your production site
        'http://localhost:3000',              // Local development
        'https://blpdepuo.gensparkspace.com', // Testing
        'https://npoaosyd.gensparkspace.com', // Latest test version
        'https://slxvhrfi.gensparkspace.com'  // Video version test
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