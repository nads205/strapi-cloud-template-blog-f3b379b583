module.exports = {
  async create(ctx) {
    try {
      const { data } = ctx.request.body;
      if (!data || !data.email) {
        ctx.status = 400;
        ctx.body = { error: 'Email is required.' };
        return;
      }
      const entry = await strapi.entityService.create('api::waitlist.waitlist', { data });
      ctx.status = 201;
      ctx.body = entry;
    } catch (error) {
      strapi.log.error('Error creating waitlist entry:', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error.' };
    }
  },
  async find(ctx) {
    try {
      const entries = await strapi.entityService.findMany('api::waitlist.waitlist');
      ctx.body = entries;
    } catch (error) {
      strapi.log.error('Error fetching waitlist entries:', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error.' };
    }
  },
  async findOne(ctx) {
    try {
      const { id } = ctx.params;
      const entry = await strapi.entityService.findOne('api::waitlist.waitlist', id);
      if (!entry) {
        ctx.status = 404;
        ctx.body = { error: 'Not found.' };
        return;
      }
      ctx.body = entry;
    } catch (error) {
      strapi.log.error('Error fetching waitlist entry:', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error.' };
    }
  },
  async update(ctx) {
    try {
      const { id } = ctx.params;
      const { data } = ctx.request.body;
      const entry = await strapi.entityService.update('api::waitlist.waitlist', id, { data });
      ctx.body = entry;
    } catch (error) {
      strapi.log.error('Error updating waitlist entry:', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error.' };
    }
  },
  async delete(ctx) {
    try {
      const { id } = ctx.params;
      await strapi.entityService.delete('api::waitlist.waitlist', id);
      ctx.status = 204;
    } catch (error) {
      strapi.log.error('Error deleting waitlist entry:', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error.' };
    }
  },
};