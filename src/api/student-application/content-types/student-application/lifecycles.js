// Track recent email sends to prevent duplicates
const recentEmails = new Map();
const EMAIL_COOLDOWN = 60000; // 1 minute cooldown

function canSendEmail(key) {
  const now = Date.now();
  const lastSent = recentEmails.get(key);
  
  if (lastSent && (now - lastSent) < EMAIL_COOLDOWN) {
    console.log(`Email blocked - too recent. Key: ${key}`);
    return false;
  }
  
  recentEmails.set(key, now);
  
  // Clean up old entries (older than 2 minutes)
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
    
    console.log('New student application created:', result.student_name, 'ID:', result.id);
    
    // Create unique keys for email deduplication
    const studentEmailKey = `student-${result.id}-${result.email}`;
    const adminEmailKey = `admin-${result.id}-${result.student_name}`;
    
    try {
      // Send welcome email to student (with deduplication)
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
                    <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString('en-GB')}</li>
                    <li><strong>Application ID:</strong> #${result.id}</li>
                  </ul>
                </div>
                
                <h3 style="color: #1e40af;">Next Steps:</h3>
                <ol>
                  <li>We'll review your application within <strong>48 hours</strong></li>
                  <li>You'll receive a decision via email</li>
                  <li>If accepted, you'll receive program details and preparation materials</li>
                  <li>The program includes daily sessions with industry professionals</li>
                </ol>
                
                <div style="background: #e0f2fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                  <p style="margin: 0;"><strong>Questions?</strong> Reply to this email or contact us at <a href="mailto:applications@plaincc.com">applications@plaincc.com</a></p>
                </div>
                
                <p>Best regards,<br>
                <strong>Student Work Experience Program Team</strong></p>
              </div>
              
              <div style="background: #1f2937; color: #9ca3af; padding: 20px; text-align: center; font-size: 14px;">
                <p style="margin: 0;">Student Work Experience Program - Financial Markets & Company Analysis</p>
                <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Plain CC. All rights reserved.</p>
              </div>
            </div>
          `,
        });
        console.log(`Student confirmation email sent to: ${result.email}`);
      } else {
        console.log(`Student email skipped (duplicate protection): ${result.email}`);
      }

      // Send notification email to admin (with deduplication)
      if (canSendEmail(adminEmailKey)) {
        await strapi.plugins['email'].services.email.send({
          to: 'naadir@plaincc.co.uk',
          subject: `New Application #${result.id} - ${result.student_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <div style="background: #dc2626; padding: 20px; text-align: center;">
                <h1 style="color: white; margin: 0;">🚨 New Student Application #${result.id}</h1>
                <p style="color: #fecaca; margin: 5px 0 0 0;">Submitted: ${new Date().toLocaleString('en-GB')}</p>
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
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://strapi.plaincc.com/admin/content-manager/collection-types/api::student-application.student-application/${result.id}" 
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
        console.log(`Admin notification email sent for application: ${result.id}`);
      } else {
        console.log(`Admin email skipped (duplicate protection): ${result.id}`);
      }

      console.log('Email processing completed for application:', result.id);
      
    } catch (error) {
      console.error('Failed to send emails for application:', result.id, error);
      
      // Log the error but don't create another application (that could cause loops)
      console.error(`Email failure details:`, {
        applicationId: result.id,
        studentName: result.student_name,
        email: result.email,
        error: error.message
      });
    }
  },
};