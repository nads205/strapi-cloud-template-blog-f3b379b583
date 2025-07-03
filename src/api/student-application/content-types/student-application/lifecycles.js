// lifecycles.js with duplicate prevention
const processedRequests = new Set();

module.exports = {
  async beforeCreate(event) {
    const { data } = event.params;
    
    // Create a unique fingerprint for this request
    const fingerprint = `${data.email}-${data.student_name}-${Date.now()}`;
    const shortFingerprint = fingerprint.substring(0, 50);
    
    console.log(`🔍 BEFORE CREATE - Fingerprint: ${shortFingerprint}`);
    console.log(`🔍 Request data:`, {
      email: data.email,
      name: data.student_name,
      timestamp: new Date().toISOString()
    });
    
    // Check if we've seen this exact request recently (within 10 seconds)
    const recentFingerprints = Array.from(processedRequests).filter(fp => {
      const timestamp = parseInt(fp.split('-').pop());
      return (Date.now() - timestamp) < 10000; // 10 seconds
    });
    
    const duplicateCheck = `${data.email}-${data.student_name}`;
    const isDuplicate = recentFingerprints.some(fp => fp.startsWith(duplicateCheck));
    
    if (isDuplicate) {
      console.log(`❌ DUPLICATE REQUEST BLOCKED: ${shortFingerprint}`);
      console.log(`❌ Recent fingerprints:`, recentFingerprints);
      
      // Throw an error to prevent the creation
      throw new Error('Duplicate application detected - request blocked');
    }
    
    // Add to processed requests
    processedRequests.add(fingerprint);
    console.log(`✅ Request approved: ${shortFingerprint}`);
    
    // Clean up old fingerprints (older than 1 minute)
    const cutoff = Date.now() - 60000;
    processedRequests.forEach(fp => {
      const timestamp = parseInt(fp.split('-').pop());
      if (timestamp < cutoff) {
        processedRequests.delete(fp);
      }
    });
  },

  async afterCreate(event) {
    const { result } = event;
    
    console.log(`📧 AFTER CREATE - Application ID: ${result.id}`);
    console.log(`📧 Student: ${result.student_name} (${result.email})`);
    
    // Your existing email code...
    try {
      console.log(`📧 Sending emails for application ${result.id}...`);
      
      // Student email
      await strapi.plugins['email'].services.email.send({
        to: result.email,
        subject: 'Application Received - Student Work Experience Program',
        html: `<p>Dear ${result.student_name}, your application #${result.id} has been received.</p>`
      });
      
      // Admin email
      await strapi.plugins['email'].services.email.send({
        to: 'naadir@plaincc.co.uk',
        subject: `New Application #${result.id} - ${result.student_name}`,
        html: `<p>New application from ${result.student_name} (${result.email})</p>`
      });
      
      console.log(`✅ Emails sent successfully for application ${result.id}`);
      
    } catch (error) {
      console.error(`❌ Email error for application ${result.id}:`, error);
    }
  }
};