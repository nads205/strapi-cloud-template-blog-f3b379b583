module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/waitlists',
      handler: 'waitlist.create',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/waitlists',
      handler: 'waitlist.find',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'GET',
      path: '/waitlists/:id',
      handler: 'waitlist.findOne',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'PUT',
      path: '/waitlists/:id',
      handler: 'waitlist.update',
      config: { policies: [], middlewares: [] },
    },
    {
      method: 'DELETE',
      path: '/waitlists/:id',
      handler: 'waitlist.delete',
      config: { policies: [], middlewares: [] },
    },
  ],
};