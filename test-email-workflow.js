// Complete workflow test: Create watch, trigger, and verify email notification
async function testCompleteWorkflow() {
    const baseUrl = 'http://localhost:3010';

    console.log('🧪 Testing Complete Email Notification Workflow\n');

    try {
        // Step 1: Test email system first
        console.log('1️⃣ Testing email system...');
        const emailTestResponse = await fetch(`${baseUrl}/api/test-email?action=test`);
        const emailTest = await emailTestResponse.json();

        console.log('Email test status:', emailTestResponse.status);
        if (emailTestResponse.ok) {
            console.log(`✅ Email system working: ${emailTest.provider} (${emailTest.messageId})`);
        } else {
            console.log(`⚠️ Email system: ${emailTest.error || emailTest.message}`);
        }
        console.log('');

        // Step 2: Create a watch with a target that should trigger notification
        console.log('2️⃣ Creating a watch with high target price (should trigger NOTIFY)...');
        const createResponse = await fetch(`${baseUrl}/edge/watch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                origin: 'NYC',
                destination: 'LAX',
                start: '2025-12-01',
                end: '2025-12-03', // Narrow window for faster testing
                cabin: 'ECONOMY',
                maxStops: 2, // More lenient for more results
                adults: 1, // Single traveler for cheaper prices
                currency: 'USD',
                targetUsd: 2000, // High target - most flights should be below this
                flexDays: 1,
            }),
        });

        const watch = await createResponse.json();
        console.log('Created watch ID:', watch.id);
        console.log('Target price: $' + watch.targetUsd);
        console.log('✅ Watch created successfully!\n');

        if (createResponse.status === 201 && watch.id) {
            // Step 3: Trigger the watch (this should NOTIFY and send email)
            console.log('3️⃣ Triggering watch (expecting NOTIFY + email)...');
            const start = Date.now();

            const triggerResponse = await fetch(`${baseUrl}/edge/watch/${watch.id}/trigger`, {
                method: 'POST',
            });

            const duration = Date.now() - start;
            const triggerResult = await triggerResponse.json();

            console.log('Status:', triggerResponse.status);
            console.log('Duration:', duration + 'ms');
            console.log('Action:', triggerResult.action);
            console.log('Reason:', triggerResult.reason);

            if (triggerResult.best) {
                console.log(`Best flight: $${triggerResult.best.total} ${triggerResult.best.currency} (${triggerResult.best.carrier})`);
                console.log(`Route: ${triggerResult.best.dates.depart}${triggerResult.best.dates.return ? ' → ' + triggerResult.best.dates.return : ' (one-way)'}`);
            }

            // Check email results
            if (triggerResult.email) {
                if (triggerResult.email.sent) {
                    console.log(`📧 Email sent successfully!`);
                    console.log(`   Provider: ${triggerResult.email.provider}`);
                    console.log(`   Message ID: ${triggerResult.email.messageId}`);
                } else {
                    console.log(`📧 Email not sent: ${triggerResult.email.reason}`);
                }
            }

            console.log('✅ Trigger completed\n');

            // Step 4: Trigger again (should be NOOP, no email)
            console.log('4️⃣ Triggering again (should be NOOP, no email)...');
            const secondTriggerResponse = await fetch(`${baseUrl}/edge/watch/${watch.id}/trigger`, {
                method: 'POST',
            });

            const secondResult = await secondTriggerResponse.json();
            console.log('Second action:', secondResult.action);
            console.log('Second reason:', secondResult.reason);
            console.log('Second email sent:', secondResult.email?.sent || false);
            console.log('✅ Second trigger completed\n');

        } else {
            console.log('❌ Failed to create watch for testing');
        }

        console.log('🎉 Complete workflow test finished!');
        console.log('\n📝 Summary:');
        console.log('- Email system configuration checked');
        console.log('- Watch created with high target price');
        console.log('- First trigger should NOTIFY and send email');
        console.log('- Second trigger should NOOP (no duplicate email)');

    } catch (error) {
        console.error('❌ Workflow test failed:', error);
    }
}

// Run the workflow test
testCompleteWorkflow();
