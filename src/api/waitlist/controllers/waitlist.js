/**
 * Waitlist Controller
 *
 * @description Handles the logic for waitlist-related operations.
 */

/**
 * @description Add a new entry to the waitlist.
 * @param {object} ctx - The Koa context object (Strapi uses Koa).
 */
module.exports = {
  async add(ctx) {
    try {
      const { email } = ctx.request.body;

      if (!email) {
        ctx.status = 400;
        ctx.body = { message: 'Email is required.' };
        return;
      }

      // TODO: Save the email to your database/service here.
      strapi.log.info(`Adding ${email} to the waitlist.`);

      // TODO: Call lifecycle/email logic here if needed.

      ctx.status = 201;
      ctx.body = { message: `Successfully added ${email} to the waitlist.` };
    } catch (error) {
      strapi.log.error('Error adding to waitlist:', error);
      ctx.status = 500;
      ctx.body = { message: 'An internal server error occurred.' };
    }
  },
};