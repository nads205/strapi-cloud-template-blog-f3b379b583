// Track recent email sends to prevent duplicates
const recentEmails = new Map();
const EMAIL_COOLDOWN = 60000; // 1 minute cooldown

function canSendEmail(key) {
  const now = Date.now();
  const lastSent = recentEmails.get(key);

  if (lastSent && (now - lastSent) < EMAIL_COOLDOWN) {
    console.log(`[canSendEmail] BLOCKED: Key '${key}' too recent. Last sent: ${new Date(lastSent).toLocaleString()}, Cooldown: ${EMAIL_COOLDOWN / 1000}s`);
    return false;
  }

  recentEmails.set(key, now);
  console.log(`[canSendEmail] ALLOWED: Key '${key}'. Marked sent at: ${new Date(now).toLocaleString()}`);


  // Clean up old entries (older than 2 minutes) - consider using setInterval for this in a real app's bootstrap
  for (const [k, v] of recentEmails.entries()) {
    if (now - v > 120000) { // Clean up entries older than 2 minutes
      recentEmails.delete(k);
      console.log(`[canSendEmail] CLEANUP: Removed old key '${k}'`);
    }
  }

  return true;
}

// Track recent SMS to prevent duplicates
const recentSMS = new Map();
const SMS_COOLDOWN = 60000; // 1 minute cooldown

function canSendSMS(key) {
  const now = Date.now();
  const lastSent = recentSMS.get(key);
  
  if (lastSent && (now - lastSent) < SMS_COOLDOWN) {
    console.log(`SMS blocked - too recent. Key: ${key}`);
    return false;
  }
  
  recentSMS.set(key, now);
  
  // Clean up old entries
  for (const [k, v] of recentSMS.entries()) {
    if (now - v > 120000) {
      recentSMS.delete(k);
    }
  }
  
  return true;
}

async function sendTwilioSMS(application) {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    console.log('⚠️ Twilio not configured, skipping SMS');
    return;
  }
  
  try {
    const client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    // SMS to student (if phone provided)
    if (application.phone) {
      const studentSMSKey = `student-sms-${application.id}-${application.phone}`;
      
      if (canSendSMS(studentSMSKey)) {
        const studentMessage = `Hi ${application.student_name}! 🎓 Your application for our Student Work Experience Program has been received. Application ID: #${application.id}. We'll review it and get back to you within 48 hours. Thanks for applying! - PlainCC Team`;
        
        await client.messages.create({
          body: studentMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: application.phone
        });
        
        console.log(`✅ Student SMS sent to: ${application.phone}`);
      } else {
        console.log(`🚫 Student SMS blocked (duplicate): ${application.phone}`);
      }
    } else {
      console.log(`ℹ️ No phone number provided for ${application.student_name}`);
    }
    
    // SMS to admin
    if (process.env.ADMIN_PHONE_NUMBER) {
      const adminSMSKey = `admin-sms-${application.id}`;
      
      if (canSendSMS(adminSMSKey)) {
        const adminMessage = `🚨 New application #${application.id} from ${application.student_name} (${application.school_name}, ${application.year_level || 'Year not specified'}). Email: ${application.email}`;
        
        await client.messages.create({
          body: adminMessage,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: process.env.ADMIN_PHONE_NUMBER
        });
        
        console.log(`✅ Admin SMS sent`);
      } else {
        console.log(`🚫 Admin SMS blocked (duplicate) for application: ${application.id}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Twilio SMS sending failed:', error);
    
    // Log specific error details
    if (error.code) {
      console.error(`Twilio Error Code: ${error.code} - ${error.message}`);
    }
  }
}


module.exports = {
  async afterCreate(event) {
    const { result } = event;
    console.log(`[afterCreate] Triggered for ID: ${result.id}, Document ID: ${result.documentId}, PublishedAt: ${result.publishedAt}`);

    // --- IMPORTANT: Only send email for the initial, published creation ---
    // If Draft & Publish were on, this ensures we only send for the true published record.
    // With Draft & Publish off, `publishedAt` will always be set here.
    if (!result.publishedAt) {
      console.log(`[afterCreate] SKIPPING: Entry ID ${result.id} is a draft or not published. No initial email sent.`);
      return;
    }
    // --- END IMPORTANT FIX ---

    console.log('New student application created (and published):', result.student_name, 'ID:', result.id, 'Document ID:', result.documentId);

    // Create unique keys for email deduplication for initial creation
    // Using 'created' in the key to differentiate from 'status change' emails
    const studentEmailKey = `student-${result.documentId || result.id}-created`;
    const adminEmailKey = `admin-${result.documentId || result.id}-created`;

    // Determine submission date (use submitted_at if available, otherwise createdAt)
    // FIX: Explicitly set timeZone to 'Europe/London' for consistent display.
    const submissionDate = result.submitted_at
      ? new Date(result.submitted_at).toLocaleString('en-GB', { timeZone: 'Europe/London' })
      : new Date(result.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London' });

    try {
      // Send welcome email to student (with deduplication)
      console.log(`[afterCreate] Checking canSendEmail for student (creation) with key: '${studentEmailKey}'`);
      if (canSendEmail(studentEmailKey)) {
        await strapi.plugins['email'].services.email.send({
          to: result.email,
          subject: 'Application Received - Student Work Experience Program',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0;">Student Work Experience Program</h1>
                <p style="color: #e0f2fe; margin: 10px 0 0 0;">Financial Markets & Company Analysis</p>
              </div>

              <div style="padding: 30px; background: #ffffff;">
                <h2 style="color: #1e40af;">Thank you for your application!</h2>

                <p>Dear <strong>${result.student_name}</strong>,</p>

                <p>Your application for the Student Work Experience Program in Financial Markets & Company Analysis has been received and is being reviewed.</p>

                <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #1e40af; margin-top: 0;">Application Details:</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>Name:</strong> ${result.student_name}</li>
                    <li><strong>School:</strong> ${result.school_name}</li>
                    <li><strong>Year Level:</strong> ${result.year_level || 'Not specified'}</li>
                    <li><strong>Submission Date:</strong> ${submissionDate}</li>
                    <li><strong>Application ID:</strong> #${result.id}</li>
                  </ul>
                </div>

                <h3 style="color: #1e40af;">Next Steps:</h3>
                <ol>
                  <li>We'll review your application <strong>shortly.</strong></li>
                  <li>You'll receive a decision via email</li>
                  <li>If accepted, you'll receive program details and preparation materials</li>
                  <li>The program includes daily sessions with industry professionals</li>
                </ol>

                <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Questions?</strong> Reply to this email or contact us at <a href="mailto:applications@plaincc.com">applications@plaincc.co.uk</a></p>
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
        console.log(`[afterCreate] Student confirmation email sent to: ${result.email}`);
      } else {
        console.log(`[afterCreate] Student email skipped by canSendEmail (creation): ${result.email}`);
      }

      // Send notification email to admin (with deduplication)
      console.log(`[afterCreate] Checking canSendEmail for admin (creation) with key: '${adminEmailKey}'`);
      if (canSendEmail(adminEmailKey)) {
        await strapi.plugins['email'].services.email.send({
          to: 'applications@plaincc.co.uk, M.a.ali2@gmail.com',
          subject: `New Application #${result.id} - ${result.student_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #dc2626; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">🚨 New Student Application #${result.id}</h1>
                <p style="color: #fecaca; margin: 5px 0 0 0;">Submitted: ${submissionDate}</p>
              </div>

              <div style="padding: 20px; background: #ffffff;">
                <h2 style="color: #dc2626;">Application Details</h2>

                <table style="width: 100%; border-collapse: collapse;">
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px; font-weight: bold; width: 30%;">Application ID:</td>
                    <td style="padding: 10px;">#${result.id}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px; font-weight: bold;">Name:</td>
                    <td style="padding: 10px;">${result.student_name}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px; font-weight: bold;">Email:</td>
                    <td style="padding: 10px;"><a href="mailto:${result.email}">${result.email}</a></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px; font-weight: bold;">Phone:</td>
                    <td style="padding: 10px;">${result.phone || 'Not provided'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px; font-weight: bold;">School:</td>
                    <td style="padding: 10px;">${result.school_name}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px; font-weight: bold;">Year Level:</td>
                    <td style="padding: 10px;">${result.year_level || 'Not specified'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px; font-weight: bold;">Emergency Contact:</td>
                    <td style="padding: 10px;">${result.emergency_contact_name || 'Not provided'} (${result.emergency_contact_phone || 'No phone'})</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                    <td style="padding: 10px; font-weight: bold;">Status:</td>
                    <td style="padding: 10px;"><span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px;">${result.application_status || 'Pending'}</span></td>
                  </tr>
                </table>

                <h3 style="color: #dc2626;">Application Content</h3>

                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
                  <h4 style="margin-top: 0;">Previous Experience:</h4>
                  <p style="margin-bottom: 0; white-space: pre-wrap;">${result.previous_experience || 'None provided'}</p>
                </div>

                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
                  <h4 style="margin-top: 0;">Why Interested:</h4>
                  <p style="margin-bottom: 0; white-space: pre-wrap;">${result.interest_reason || 'Not provided'}</p>
                </div>

                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
                  <h4 style="margin-top: 0;">Preferred Dates:</h4>
                  <p style="margin-bottom: 0;">${result.preferred_dates || 'None specified'}</p>
                </div>
                
                <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
                  <h4 style="margin-top: 0;">Notes:</h4>
                  <p style="margin-bottom: 0; white-space: pre-wrap;">${result.notes || 'None provided'}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://strapi.plaincc.com/admin/content-manager/collection-types/api::student-application.student-application/${result.documentId}"
                     style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                     📊 View Application #${result.id}
                  </a>
                  <a href="https://strapi.plaincc.com/admin/content-manager/collection-types/api::student-application.student-application"
                     style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                     📋 All Applications
                  </a>
                </div>
              </div>
            </div>
          `,
        });
        console.log(`[afterCreate] Admin notification email sent for application: ${result.id}`);
      } else {
        console.log(`[afterCreate] Admin email skipped by canSendEmail (creation): ${result.id}`);
      }

      console.log('[afterCreate] Email processing completed for initial application creation.');

    } catch (error) {
      console.error(`[afterCreate] ERROR: Failed to send emails for initial application creation ID: ${result.id}`, error);
      console.error(`[afterCreate] Email failure details:`, {
        applicationId: result.id,
        studentName: result.student_name,
        email: result.email,
        error: error.message
      });
    }
  },

  async beforeUpdate(event) {
    const { params } = event;
    console.log(`[beforeUpdate] Triggered for params: ${JSON.stringify(params)}`);

    if (params.where && params.where.id) {
      try {
        const oldEntry = await strapi.db.query('api::student-application.student-application').findOne({
          where: { id: params.where.id },
        });

        event.state = event.state || {};
        event.state.oldApplicationStatus = oldEntry ? oldEntry.application_status : null;
        console.log(`[beforeUpdate] Successfully fetched old entry ID: ${params.where.id}. Old status: '${event.state.oldApplicationStatus}'`);

        console.log(`[beforeUpdate] Incoming update data: ${JSON.stringify(params.data)}`);

      } catch (error) {
        console.error(`[beforeUpdate] ERROR fetching old entry ID: ${params.where.id}`, error);
        event.state = event.state || {};
        event.state.oldApplicationStatus = null;
      }
    } else {
      console.log(`[beforeUpdate] Skipping fetch for ID. Params.where.id not found.`);
    }
  },

  async afterUpdate(event) {
    const { result, state } = event;
    console.log(`[afterUpdate] Triggered for ID: ${result.id}, Document ID: ${result.documentId}`);
    console.log(`[afterUpdate] Current result.publishedAt: ${result.publishedAt}`);

    // Ensure we only send emails for published updates, not draft updates.
    // With Draft & Publish off, this will almost always be true, but it's a good safeguard.
    if (!result.publishedAt) {
      console.log(`[afterUpdate] SKIPPING: Entry ID ${result.id} is a draft or not published. No email sent.`);
      return;
    }

    const oldStatus = state ? state.oldApplicationStatus : null;
    const newStatus = result.application_status;

    console.log(`[afterUpdate] Comparison -> Old status: '${oldStatus}', New status: '${newStatus}'`);
    console.log(`[afterUpdate] oldStatus !== newStatus: ${oldStatus !== newStatus}`);

    // Determine submission date (use submitted_at if available, otherwise createdAt)
    // FIX: Explicitly set timeZone to 'Europe/London' for consistent display.
    const submissionDate = result.submitted_at
      ? new Date(result.submitted_at).toLocaleString('en-GB', { timeZone: 'Europe/London' })
      : new Date(result.createdAt).toLocaleString('en-GB', { timeZone: 'Europe/London' });

    if (oldStatus !== newStatus) {
      console.log(`[afterUpdate] CONDITION MET: Application status for ID ${result.id} changed from '${oldStatus}' to '${newStatus}'. Proceeding with email checks.`);

      // Create unique keys for email deduplication for status changes
      // Using 'status-change' in the key to differentiate from 'created' emails
      const studentEmailKey = `student-${result.documentId || result.id}-status-change-${newStatus}`;
      const adminEmailKey = `admin-${result.documentId || result.id}-status-change-${newStatus}`;

      try {
        // Send student email (reverted to original content without notes/submission date in this email)
        console.log(`[afterUpdate] Checking canSendEmail for student (status change) with key: '${studentEmailKey}'`);
        if (canSendEmail(studentEmailKey)) {
          await strapi.plugins['email'].services.email.send({
            to: result.email,
            subject: `Application Status Update - ${result.application_status}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%); padding: 30px; text-align: center;">
                  <h1 style="color: white; margin: 0;">Student Work Experience Program</h1>
                  <p style="color: #e0f2fe; margin: 10px 0 0 0;">Financial Markets & Company Analysis</p>
                </div>

                <div style="padding: 30px; background: #ffffff;">
                  <h2 style="color: #1e40af;">Your Application Status Has Changed!</h2>

                  <p>Dear <strong>${result.student_name}</strong>,</p>

                  <p>We're writing to inform you that the status of your application for the Student Work Experience Program (ID: #${result.id}) has been updated.</p>

                  <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #1e40af; margin-top: 0;">Updated Status:</h3>
                    <p style="font-size: 20px; font-weight: bold; color: #dc2626; text-align: center;">${newStatus}</p>
                    <p style="margin-top: 15px;">Please check your previous communications for details regarding this status change. If you have any questions, please reach out to us.</p>
                  </div>

                  <h3 style="color: #1e40af;">Application Details:</h3>
                  <ul style="margin: 0; padding-left: 20px;">
                    <li><strong>Name:</strong> ${result.student_name}</li>
                    <li><strong>School:</strong> ${result.school_name}</li>
                    <li><strong>Current Status:</strong> ${newStatus}</li>
                    <li><strong>Application ID:</strong> #${result.id}</li>
                  </ul>

                  <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Questions?</strong> Reply to this email or contact us at <a href="mailto:applications@plaincc.com">applications@plaincc.com</a></p>
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
          console.log(`[afterUpdate] Student status update email sent to: ${result.email}`);
        } else {
          console.log(`[afterUpdate] Student email skipped by canSendEmail (status change): ${result.email}`);
        }

        // Send notification email to admin (with deduplication)
        console.log(`[afterUpdate] Checking canSendEmail for admin (status change) with key: '${adminEmailKey}'`);
        if (canSendEmail(adminEmailKey)) {
          await strapi.plugins['email'].services.email.send({
            to: 'applications@plaincc.co.uk, M.a.ali2@gmail.com',
            subject: `Application Status Change - #${result.id} (${result.student_name})`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: #dc2626; padding: 20px; text-align: center;">
                  <h1 style="color: white; margin: 0;">🚨 Application Status Update #${result.id}</h1>
                  <p style="color: #fecaca; margin: 5px 0 0 0;">Status Changed: ${new Date().toLocaleString('en-GB')}</p>
                </div>

                <div style="padding: 20px; background: #ffffff;">
                  <h2 style="color: #dc2626;">Status Changed for Application ID: #${result.id}</h2>

                  <p>The application for <strong>${result.student_name}</strong> has had its status updated:</p>

                  <div style="background: #fef3c7; color: #92400e; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; font-size: 18px; font-weight: bold;">
                    Old Status: <span style="text-decoration: line-through;">${oldStatus || 'N/A'}</span> &rarr; New Status: ${newStatus}
                  </div>

                  <table style="width: 100%; border-collapse: collapse;">
                    <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; font-weight: bold; width: 30%;">Application ID:</td>
                      <td style="padding: 10px;">#${result.id}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; font-weight: bold;">Name:</td>
                      <td style="padding: 10px;">${result.student_name}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; font-weight: bold;">Email:</td>
                      <td style="padding: 10px;"><a href="mailto:${result.email}">${result.email}</a></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; font-weight: bold;">Phone:</td>
                      <td style="padding: 10px;">${result.phone || 'Not provided'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; font-weight: bold;">School:</td>
                      <td style="padding: 10px;">${result.school_name}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; font-weight: bold;">Year Level:</td>
                      <td style="padding: 10px;">${result.year_level || 'Not specified'}</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; font-weight: bold;">Emergency Contact:</td>
                      <td style="padding: 10px;">${result.emergency_contact_name || 'Not provided'} (${result.emergency_contact_phone || 'No phone'})</td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; font-weight: bold;">Status:</td>
                      <td style="padding: 10px;"><span style="background: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 4px;">${result.application_status || 'Pending'}</span></td>
                  </tr>
                  <tr style="border-bottom: 1px solid #e5e7eb;">
                      <td style="padding: 10px; font-weight: bold;">Submission Date:</td>
                      <td style="padding: 10px;">${submissionDate}</td>
                  </tr>
                  </table>

                  <h3 style="color: #dc2626;">Application Content</h3>

                  <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
                      <h4 style="margin-top: 0;">Previous Experience:</h4>
                      <p style="margin-bottom: 0; white-space: pre-wrap;">${result.previous_experience || 'None provided'}</p>
                  </div>

                  <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
                      <h4 style="margin-top: 0;">Why Interested:</h4>
                      <p style="margin-bottom: 0; white-space: pre-wrap;">${result.interest_reason || 'Not provided'}</p>
                  </div>

                  <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
                      <h4 style="margin-top: 0;">Preferred Dates:</h4>
                      <p style="margin-bottom: 0;">${result.preferred_dates || 'None specified'}</p>
                  </div>
                  
                  <div style="background: #f9fafb; padding: 15px; border-radius: 8px; margin: 10px 0;">
                      <h4 style="margin-top: 0;">Notes:</h4>
                      <p style="margin-bottom: 0; white-space: pre-wrap;">${result.notes || 'None provided'}</p>
                  </div>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="https://strapi.plaincc.com/admin/content-manager/collection-types/api::student-application.student-application/${result.documentId}"
                       style="background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-right: 10px;">
                       📊 View Application #${result.id}
                    </a>
                    <a href="https://strapi.plaincc.com/admin/content-manager/collection-types/api::student-application.student-application"
                       style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                       📋 All Applications
                    </a>
                  </div>
              </div>
            </div>
          `,
          });
          console.log(`[afterUpdate] Admin notification email sent for application: ${result.id}`);
        } else {
          console.log(`[afterUpdate] Admin email skipped by canSendEmail (status change): ${result.id}`);
        }

        console.log('[afterUpdate] Status change email processing completed for application.');

      } catch (error) {
        console.error(`[afterUpdate] ERROR: Failed to send emails for application status change ID: ${result.id}`, error);
        console.error(`[afterUpdate] Email failure details:`, {
          applicationId: result.id,
          studentName: result.student_name,
          email: result.email,
          error: error.message,
          oldStatus: oldStatus,
          newStatus: newStatus
        });
      }
    } else {
      console.log(`[afterUpdate] SKIPPING: Application ID ${result.id} updated, but status did not change ('${oldStatus}' to '${newStatus}') or old status was not found. No email sent.`);
    }
  },
};