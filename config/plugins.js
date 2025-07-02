module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('MAILERSEND_SMTP_HOST', 'smtp.mailersend.net'),
        port: env('MAILERSEND_SMTP_PORT', 587),
        secure: false,
        auth: {
          user: env('MAILERSEND_SMTP_USER'),
          pass: env('MAILERSEND_SMTP_PASS'),
        },
        // Additional options to ensure override
        pool: true,
        maxConnections: 1,
        rateDelta: 20000,
        rateLimit: 5,
      },
      settings: {
        defaultFrom: env('MAILERSEND_FROM_EMAIL', 'applications@plaincc.com'),
        defaultReplyTo: env('MAILERSEND_REPLY_TO', 'noreply@plaincc.com'),
      },
    },
  },
});