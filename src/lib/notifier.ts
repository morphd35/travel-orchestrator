// Email notification system with multiple provider support

interface EmailPayload {
    to: string;
    subject: string;
    html: string;
    text: string;
}

interface EmailResponse {
    messageId: string;
    provider: string;
}

// Environment variables
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const MAILGUN_API_KEY = process.env.MAILGUN_API_KEY;
const MAILGUN_DOMAIN = process.env.MAILGUN_DOMAIN;

/**
 * Send email via SendGrid (using official SDK)
 */
async function sendViaSendGrid(payload: EmailPayload): Promise<EmailResponse> {
    if (!SENDGRID_API_KEY) {
        throw new Error('SENDGRID_API_KEY not configured');
    }

    try {
        // Import SendGrid SDK dynamically
        const sgMail = (await import('@sendgrid/mail')).default;
        sgMail.setApiKey(SENDGRID_API_KEY);

        const msg = {
            to: payload.to,
            from: {
                email: process.env.SENDGRID_FROM_EMAIL || process.env.NOTIFY_TO || 'morphd35@gmail.com',
                name: 'Travel Orchestrator'
            },
            subject: payload.subject,
            text: payload.text,
            html: payload.html,
        };

        const response = await sgMail.send(msg);

        // SendGrid SDK returns response with message ID
        const messageId = response[0]?.headers?.['x-message-id'] || `sendgrid_${Date.now()}`;

        return {
            messageId,
            provider: 'SendGrid',
        };

    } catch (error: any) {
        // Handle SendGrid-specific errors
        if (error.response) {
            const errorBody = error.response.body;
            throw new Error(`SendGrid API error: ${error.code}. ${JSON.stringify(errorBody).slice(0, 300)}`);
        }
        throw new Error(`SendGrid error: ${error.message}`);
    }
}

/**
 * Send email via Mailgun
 */
async function sendViaMailgun(payload: EmailPayload): Promise<EmailResponse> {
    if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN) {
        throw new Error('MAILGUN_API_KEY and MAILGUN_DOMAIN not configured');
    }

    const formData = new FormData();
    const fromEmail = process.env.SENDGRID_FROM_EMAIL || process.env.NOTIFY_TO || 'alerts@' + MAILGUN_DOMAIN;
    formData.append('from', `Travel Orchestrator <${fromEmail}>`);
    formData.append('to', payload.to);
    formData.append('subject', payload.subject);
    formData.append('text', payload.text);
    formData.append('html', payload.html);

    const response = await fetch(`https://api.mailgun.net/v3/${MAILGUN_DOMAIN}/messages`, {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + Buffer.from(`api:${MAILGUN_API_KEY}`).toString('base64'),
        },
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Mailgun API error: ${response.status} ${response.statusText}. Body: ${errorText.slice(0, 300)}`);
    }

    const result = await response.json();

    return {
        messageId: result.id || `mailgun_${Date.now()}`,
        provider: 'Mailgun',
    };
}

/**
 * Main email sending function - automatically chooses provider based on env vars
 */
export async function sendEmail(payload: EmailPayload): Promise<EmailResponse> {
    // Validate required fields
    if (!payload.to || !payload.subject || (!payload.html && !payload.text)) {
        throw new Error('Email payload missing required fields: to, subject, and html or text');
    }

    // Choose provider based on available environment variables
    let provider: 'sendgrid' | 'mailgun' | null = null;

    if (SENDGRID_API_KEY) {
        provider = 'sendgrid';
    } else if (MAILGUN_API_KEY && MAILGUN_DOMAIN) {
        provider = 'mailgun';
    }

    if (!provider) {
        console.log('📧 Email disabled: No email provider configured (SENDGRID_API_KEY or MAILGUN_API_KEY+MAILGUN_DOMAIN)');
        return {
            messageId: `disabled_${Date.now()}`,
            provider: 'disabled',
        };
    }

    try {
        let result: EmailResponse;

        if (provider === 'sendgrid') {
            console.log('📧 Sending email via SendGrid...');
            result = await sendViaSendGrid(payload);
        } else {
            console.log('📧 Sending email via Mailgun...');
            result = await sendViaMailgun(payload);
        }

        console.log(`✅ Email sent successfully via ${result.provider}, messageId: ${result.messageId}`);
        return result;

    } catch (error) {
        console.error(`❌ Failed to send email via ${provider}:`, error);
        throw error;
    }
}

/**
 * Helper function to generate plain text from HTML
 */
export function htmlToText(html: string): string {
    return html
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Test email function for development
 */
export async function sendTestEmail(to: string): Promise<EmailResponse> {
    const testPayload: EmailPayload = {
        to,
        subject: '✈️ Travel Orchestrator Test Email',
        html: `
      <h2>🧪 Test Email</h2>
      <p>This is a test email from Travel Orchestrator.</p>
      <p>If you received this, your email configuration is working correctly!</p>
      <p><small>Sent at: ${new Date().toISOString()}</small></p>
    `,
        text: `Test Email\n\nThis is a test email from Travel Orchestrator.\nIf you received this, your email configuration is working correctly!\n\nSent at: ${new Date().toISOString()}`,
    };

    return await sendEmail(testPayload);
}
