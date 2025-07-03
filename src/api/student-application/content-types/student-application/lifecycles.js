module.exports = {
  async afterUpdate(event) {
    const { result, params } = event;
    
    // Only send email when status changes to specific values
    const statusChangesThatTriggerEmail = ['Accepted', 'Rejected', 'Waitlisted'];
    
    // Check if status actually changed and is one that should trigger email
    if (params.data.application_status && 
        statusChangesThatTriggerEmail.includes(params.data.application_status)) {
      
      // Get the full application data
      const application = await strapi.entityService.findOne(
        'api::student-application.student-application', 
        result.id
      );
      
      // Don't send email if just notes were updated (no status change)
      if (params.data.admin_notes && !params.data.application_status) {
        return; // Skip email for notes-only updates
      }
      
      try {
        // Send email based on status
        await strapi.plugins['email'].services.email.send({
          to: application.email,
          from: 'noreply@plaincc.com',
          subject: getEmailSubject(application.application_status),
          html: getEmailTemplate(application)
        });
        
        console.log(`Email sent to ${application.email} for status: ${application.application_status}`);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    }
  },

  async afterCreate(event) {
    const { result } = event;
    
    try {
      // Send confirmation email to student
      await strapi.plugins['email'].services.email.send({
        to: result.email,
        from: 'noreply@plaincc.com',
        subject: 'Application Received - Student Work Experience Program',
        html: getConfirmationEmailTemplate(result)
      });
      
      // Send notification to admin
      await strapi.plugins['email'].services.email.send({
        to: 'applications@plaincc.com', // Your admin email
        from: 'noreply@plaincc.com',
        subject: 'New Application Received',
        html: getAdminNotificationTemplate(result)
      });
      
    } catch (error) {
      console.error('Error sending confirmation email:', error);
    }
  }
};

function getEmailSubject(status) {
  switch (status) {
    case 'Accepted':
      return '🎉 Congratulations! Your application has been accepted';
    case 'Rejected':
      return 'Update on your Work Experience Application';
    case 'Waitlisted':
      return 'Your application status - Student Work Experience Program';
    default:
      return 'Application Status Update';
  }
}

function getEmailTemplate(application) {
  switch (application.application_status) {
    case 'Accepted':
      return `
        <h2>Congratulations ${application.student_name}!</h2>
        <p>We're pleased to inform you that your application for the Student Work Experience Program has been <strong>accepted</strong>.</p>
        <p>We'll be in touch soon with program details and next steps.</p>
        <p>Best regards,<br>Student Work Experience Program Team</p>
      `;
    case 'Rejected':
      return `
        <h2>Thank you for your application</h2>
        <p>Dear ${application.student_name},</p>
        <p>Thank you for your interest in our Student Work Experience Program. While we were impressed by your application, we're unable to offer you a place in this session.</p>
        <p>We encourage you to apply for future sessions.</p>
        <p>Best regards,<br>Student Work Experience Program Team</p>
      `;
    case 'Waitlisted':
      return `
        <h2>Application Update</h2>
        <p>Dear ${application.student_name},</p>
        <p>Your application is currently on our waitlist. We'll contact you if a place becomes available.</p>
        <p>Best regards,<br>Student Work Experience Program Team</p>
      `;
    default:
      return `<p>Your application status has been updated.</p>`;
  }
}

function getConfirmationEmailTemplate(application) {
  return `
    <h2>Application Received!</h2>
    <p>Dear ${application.student_name},</p>
    <p>Thank you for applying to our Student Work Experience Program. We've received your application and will review it shortly.</p>
    <p><strong>Application Details:</strong></p>
    <ul>
      <li>Name: ${application.student_name}</li>
      <li>School: ${application.school_name}</li>
      <li>Year Level: ${application.year_level}</li>
      <li>Submitted: ${new Date(application.submitted_at || application.createdAt).toLocaleDateString()}</li>
    </ul>
    <p>We'll be in touch soon with an update on your application.</p>
    <p>Best regards,<br>Student Work Experience Program Team</p>
  `;
}

function getAdminNotificationTemplate(application) {
  return `
    <h2>New Application Received</h2>
    <p><strong>Student:</strong> ${application.student_name}</p>
    <p><strong>Email:</strong> ${application.email}</p>
    <p><strong>School:</strong> ${application.school_name}</p>
    <p><strong>Year Level:</strong> ${application.year_level}</p>
    <p><strong>Interest Reason:</strong> ${application.interest_reason}</p>
    <p><a href="https://strapi.plaincc.com/admin/content-manager/collection-types/api::student-application.student-application">Review in Admin Panel</a></p>
  `;
}