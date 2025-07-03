module.exports = [
  'strapi::errors',
  // Add request logging middleware
  {
    name: 'global::request-logger',
    config: {},
    async resolve() {
      return async (ctx, next) => {
        if (ctx.path.includes('/student-applications') && ctx.method === 'POST') {
          const requestId = Math.random().toString(36).substring(2, 15);
          console.log(`🌐 REQUEST ${requestId}: ${ctx.method} ${ctx.path}`);
          console.log(`🌐 Headers:`, ctx.headers);
          console.log(`🌐 Body:`, ctx.request.body);
          console.log(`🌐 Timestamp:`, new Date().toISOString());
        }
        await next();
      };
    },
  },
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
        'https://jolly-meadow-065c3c003-4.westeurope.6.azurestaticapps.net',
        'https://jolly-meadow-065c3c003-5.westeurope.6.azurestaticapps.net'
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
