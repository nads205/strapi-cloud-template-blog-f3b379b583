module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: 'smtp.mailersend.net',
        port: 587,
        secure: false,
        auth: {
          user: env('MAILERSEND_SMTP_USER'),
          pass: env('MAILERSEND_SMTP_PASS'),
        },
      },
      settings: {
        defaultFrom: env('MAILERSEND_FROM_EMAIL', 'applications@plaincc.com'),
        defaultReplyTo: env('MAILERSEND_REPLY_TO', 'noreply@plaincc.com'),
      },
    },
  },
});