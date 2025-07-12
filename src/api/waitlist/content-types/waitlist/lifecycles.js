/**
 * Waitlist Lifecycles
 *
 * @description Handles actions after waitlist entry creation, such as sending emails.
 */

const recentEmails = new Map();
const EMAIL_COOLDOWN = 60000; // 1 minute cooldown

function canSendEmail(key) {
  const now = Date.now();
  const lastSent = recentEmails.get(key);
  if (lastSent && (now - lastSent) < EMAIL_COOLDOWN) {
    return false;
  }
  recentEmails.set(key, now);
  for (const [k, v] of recentEmails.entries()) {
    if (now - v > 120000) {
      recentEmails.delete(k);
    }
  }
  return true;
}

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    // Only send email for published creation
    if (!result.publishedAt) return;

    // Compose waitlist confirmation email
    const studentEmailKey = `waitlist-student-${result.documentId || result.id}-created`;
    const adminEmailKey = `waitlist-admin-${result.documentId || result.id}-created`;
    const submissionDate = result.submitted_at
      ? new Date(result.submitted_at).toLocaleString('en-GB', { timeZone: 'Europe/London' })
      : new Date(result.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London' });

    try {
      // Send confirmation email to student
      if (canSendEmail(studentEmailKey)) {
        await strapi.plugins['email'].services.email.send({
          to: result.email,
          subject: 'Waitlist Confirmation - Student Work Experience Program',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Student Work Experience Program</h1>
                <p style="color: #e0f2fe; margin: 10px 0 0 0;">Waitlist Confirmation</p>
              </div>
              <div style="padding: 30px; background: #ffffff;">
                <h2 style="color: #059669;">Thank you for joining our waitlist!</h2>
                <p>Dear <strong>${result.full_name}</strong>,</p>
                <p>We have received your waitlist submission for future programmes. You'll be among the first to know when new sessions are announced.</p>
                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #059669; margin-top: 0;">Waitlist Details:</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>Name:</strong> ${result.full_name}</li>
                    <li><strong>Email:</strong> ${result.email}</li>
                    <li><strong>Year Level:</strong> ${result.year_level || 'Not specified'}</li>
                    <li><strong>School/University:</strong> ${result.school_or_university || 'Not specified'}</li>
                    <li><strong>Preferred Programme:</strong> ${result.interest_level || 'Any time'}</li>
                    <li><strong>Comments:</strong> ${result.additional_comments || 'None'}</li>
                    <li><strong>Submission Date:</strong> ${submissionDate}</li>
                  </ul>
                </div>
                <p>Best regards,<br>
                <strong>Student Work Experience Program Team</strong></p>
              </div>
              <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
                <p style="margin: 0;">Student Work Experience Program - Financial Markets & Company Analysis</p>
                <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Student Work Experience Program. All rights reserved.</p>
              </div>
            </div>
          `,
        });
      }
      // Send notification email to admins
      if (canSendEmail(adminEmailKey)) {
        await strapi.plugins['email'].services.email.send({
          to: 'applications@plaincc.co.uk, cvboosters@gmail.com',
          subject: `New Waitlist Submission #${result.id} - ${result.full_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #f59e42; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">🟠 New Waitlist Submission #${result.id}</h1>
                <p style="color: #fff7ed; margin: 5px 0 0 0;">Submitted: ${submissionDate}</p>
              </div>
              <div style="padding: 20px; background: #ffffff;">
                <h2 style="color: #f59e42;">Waitlist Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 10px; font-weight: bold; width: 30%;">Waitlist ID:</td><td style="padding: 10px;">#${result.id}</td></tr>
                  <tr><td style="padding: 10px; font-weight: bold;">Name:</td><td style="padding: 10px;">${result.full_name}</td></tr>
                  <tr><td style="padding: 10px; font-weight: bold;">Email:</td><td style="padding: 10px;"><a href="mailto:${result.email}">${result.email}</a></td></tr>
                  <tr><td style="padding: 10px; font-weight: bold;">Year Level:</td><td style="padding: 10px;">${result.year_level || 'Not specified'}</td></tr>
                  <tr><td style="padding: 10px; font-weight: bold;">School/University:</td><td style="padding: 10px;">${result.school_or_university || 'Not specified'}</td></tr>
                  <tr><td style="padding: 10px; font-weight: bold;">Preferred Programme:</td><td style="padding: 10px;">${result.interest_level || 'Any time'}</td></tr>
                  <tr><td style="padding: 10px; font-weight: bold;">Comments:</td><td style="padding: 10px;">${result.additional_comments || 'None'}</td></tr>
                  <tr><td style="padding: 10px; font-weight: bold;">Submission Date:</td><td style="padding: 10px;">${submissionDate}</td></tr>
                </table>
              </div>
            </div>
          `,
        });
      }
    } catch (error) {
      if (typeof strapi !== 'undefined' && strapi.log) {
        strapi.log.error(`[waitlist.afterCreate] ERROR: Failed to send emails for waitlist ID: ${result.id}`, error);
      } else {
        console.error(`[waitlist.afterCreate] ERROR: Failed to send emails for waitlist ID: ${result.id}`, error);
      }
    }
  },
};