const sgMail = require('@sendgrid/mail');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

console.log('🔧 Testing SendGrid Configuration...');
console.log('📧 From Email:', process.env.SENDGRID_FROM_EMAIL);
console.log('🔑 API Key:', process.env.SENDGRID_API_KEY ? `${process.env.SENDGRID_API_KEY.substring(0, 10)}...` : 'NOT SET');

if (!process.env.SENDGRID_API_KEY) {
    console.error('❌ SENDGRID_API_KEY not found in environment variables');
    process.exit(1);
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
    to: 'morphd335@yahoo.com', // Your email
    from: process.env.SENDGRID_FROM_EMAIL || 'morphd35@gmail.com',
    subject: 'SendGrid Test - Travel Conductor',
    html: `
        <h2>SendGrid Test Email</h2>
        <p>If you receive this email, SendGrid is working correctly!</p>
        <p>Time: ${new Date().toISOString()}</p>
    `,
    text: `SendGrid Test Email - If you receive this, SendGrid is working! Time: ${new Date().toISOString()}`
};

async function testSendGrid() {
    try {
        console.log('📤 Sending test email...');
        const response = await sgMail.send(msg);
        console.log('✅ Email sent successfully!');
        console.log('📊 Response:', response[0].statusCode, response[0].statusMessage);
        console.log('🆔 Message ID:', response[0].headers['x-message-id']);
    } catch (error) {
        console.error('❌ SendGrid Error:', error.message);
        if (error.response) {
            console.error('📋 Error Details:', error.response.body);
        }
    }
}

testSendGrid();
