import dotenv from 'dotenv';

// Load environment variables FIRST, before importing modules that use them
dotenv.config({ path: '.env.local' });

import { sendEmail } from '@/lib/notifier';

async function testEmail() {
    try {
        console.log('🧪 Testing email system...');
        console.log('📧 Sending to:', process.env.NOTIFY_TO);
        console.log('📧 From:', process.env.SENDGRID_FROM_EMAIL);
        console.log('🔑 SendGrid API Key:', process.env.SENDGRID_API_KEY ? `${process.env.SENDGRID_API_KEY.substring(0, 10)}...` : 'NOT SET');

        const result = await sendEmail({
            to: process.env.NOTIFY_TO || 'morphd35@gmail.com',
            subject: '🧪 Test Email from Travel Conductor',
            html: `
                <h2>Email Test Successful! ✅</h2>
                <p>This is a test email to verify your email notifications are working.</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
                <p>If you receive this email, your watch notifications will work correctly!</p>
            `,
            text: `
Email Test Successful! ✅

This is a test email to verify your email notifications are working.

Time: ${new Date().toLocaleString()}
Environment: ${process.env.NODE_ENV}

If you receive this email, your watch notifications will work correctly!
            `
        });

        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', result.messageId);
        console.log('📧 Provider:', result.provider);

    } catch (error) {
        console.error('❌ Email test failed:', error);
    }
}

testEmail();
