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
        to: 'naadir@plaincc.co.uk', // Replace with your actual email
        subject: `New Application - ${result.student_name}`,
        html: `
          <h2>New Student Application Received</h2>
          <h3>Student Details:</h3>
          <ul>
            <li><strong>Name:</strong> ${result.student_name}</li>