module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/email-test',
      handler: 'emailtest.send',
      config: {
        auth: false,
      },
    },
  ],
};

