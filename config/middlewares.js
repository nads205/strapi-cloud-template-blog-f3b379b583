module.exports = [
  'strapi::errors',
  
  // Custom request logger middleware
  (config, { strapi }) => {
    return async (ctx, next) => {
      if (ctx.path.includes('/student-applications') && ctx.method === 'POST') {
        const requestId = Math.random().toString(36).substring(2, 15);
        console.log(`🌐 REQUEST ${requestId}: ${ctx.method} ${ctx.path}`);
        console.log(`🌐 Headers:`, JSON.stringify(ctx.headers, null, 2));
        console.log(`🌐 Body:`, JSON.stringify(ctx.request.body, null, 2));
        console.log(`🌐 Timestamp:`, new Date().toISOString());
      }
      await next();
    };
  },
  
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
        'http://localhost:3000',
        'http://localhost:1337',
        'https://strapi.plaincc.com'
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