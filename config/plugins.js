module.exports = ({ env }) => ({
  email: {
    config: {
      provider: 'sendmail',
      settings: {
        defaultFrom: 'noreply@plaincc.com',
        defaultReplyTo: 'applications@plaincc.com',
      },
    },
  },
});
