module.exports = {
  async send(ctx) {
    try {
      await strapi.plugins['email'].services.email.send({
        to: 'naadir@plaincc.co.uk',
        subject: '✅ Programmatic Email from Strapi Cloud',
        text: 'It works! This is a test sent via MailerSend + Nodemailer.',
        html: '<p>🎉 Success! If you received this, your setup is live.</p>',
      });

      ctx.send({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Email send error:', error);
      ctx.send({ success: false, error: error.message });
    }
  },
};

