/**
 * Waitlist Lifecycles
 *
 * @description Handles actions after waitlist entry creation, such as sending emails.
 */

const sendWaitlistConfirmation = async (waitlistData) => {
  // TODO: Implement email sending logic to student
};

const notifyAdmins = async (waitlistData) => {
  // TODO: Implement email sending logic to admins
};

module.exports = {
  sendWaitlistConfirmation,
  notifyAdmins,
};