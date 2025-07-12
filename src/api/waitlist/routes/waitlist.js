module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/waitlist',
      handler: 'waitlist.add',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};