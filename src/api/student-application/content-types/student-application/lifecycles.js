module.exports = {
  async afterCreate(event) {
    const { result } = event;

    console.log('New student application created:', result.student_name);
    try {
      // Send welcome email to student
      await strapi.plugins['email'].services.email.send({
        to: result.email,
        subject: 'Application Received - Student Work Experience Program',
        html: `
          <h2>Thank you for your application!</h2>
          <p>Dear ${result.student_name},</p>
          <p>Your application for the Student Work Experience Program in Financial Markets & Company Analysis has been received.</p>
          <h3>Application Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${result.student_name}</li>
            <li><strong>School:</strong> ${result.school_name}</li>
            <li><strong>Year Level:</strong> ${result.year_level}</li>
            <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</li>
          </ul>
          <h3>Next Steps:</h3>
          <ol>
            <li>We'll review your application within 48 hours</li>
            <li>You'll receive a decision via email</li>
            <li>If accepted, you'll receive program details and preparation materials</li>
          </ol>
          <p>Questions? Reply to this email or contact us at applications@plaincc.com</p>
          <p>Best regards,<br>
          Student Work Experience Program Team</p>
        `,
      });

       // Send notification email to admin
      await strapi.plugins['email'].services.email.send({
        to: 'naadir@plaincc.co.uk',
        subject: `New Application - ${result.student_name}`,
        html: `
          <h2>New Student Application Received</h2>
          <h3>Student Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${result.student_name}</li>
            <li><strong>Email:</strong> ${result.email}</li>
            <li><strong>Phone:</strong> ${result.phone || 'Not provided'}</li>
            <li><strong>School:</strong> ${result.school_name}</li>
            <li><strong>Year Level:</strong> ${result.year_level}</li>
            <li><strong>Emergency Contact:</strong> ${result.emergency_contact_name} (${result.emergency_contact_phone})</li>
          </ul>
          <h3>Application Content:</h3>
          <p><strong>Previous Experience:</strong><br>${result.previous_experience || 'None provided'}</p>
          <p><strong>Interest Reason:</strong><br>${result.interest_reason || 'None provided'}</p>
          <p><strong>Preferred Dates:</strong> ${result.preferred_dates || 'None specified'}</p>
          <p><a href="https://lively-cactus-806ba46df7.strapiapp.com/admin/content-manager/collection-types/api::student-application.student-application">View in Admin Panel</a></p>
        `,
      });

      console.log('Emails sent successfully for application:', result.id);

    } catch (error) {
      console.error('Failed to send emails:', error);
    }
  },
};