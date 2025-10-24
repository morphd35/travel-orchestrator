// HTML email template for fare drop notifications

interface FareEmailData {
    origin: string;
    destination: string;
    depart: string;
    returnDate?: string;
    total: number;
    currency: string;
    carrier: string;
    stops: {
        out: number;
        back?: number;
    };
    deeplinkUrl: string;
    targetPrice?: number;
}

/**
 * Render HTML email for fare drop notification
 */
export function renderFareEmail(data: FareEmailData): string {
    const {
        origin,
        destination,
        depart,
        returnDate,
        total,
        currency,
        carrier,
        stops,
        deeplinkUrl,
        targetPrice
    } = data;

    const tripType = returnDate ? 'Round-trip' : 'One-way';
    const stopsText = stops.out === 0 ? 'Non-stop' : `${stops.out} stop${stops.out > 1 ? 's' : ''}`;
    const returnStopsText = returnDate && stops.back !== undefined
        ? (stops.back === 0 ? 'Non-stop' : `${stops.back} stop${stops.back > 1 ? 's' : ''}`)
        : null;

    const formatDate = (dateStr: string): string => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const savingsText = targetPrice && total < targetPrice
        ? `<p style="color: #28a745; font-weight: bold; margin: 10px 0;">💰 ${currency} ${(targetPrice - total).toFixed(2)} below your target!</p>`
        : '';

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Flight Price Alert</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden;">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">✈️ Flight Price Alert</h1>
            <p style="margin: 5px 0 0 0; opacity: 0.9;">Great news! We found a deal for you</p>
        </div>
        
        <!-- Main Content -->
        <div style="padding: 30px;">
            
            <!-- Price Banner -->
            <div style="background: #f8f9fa; border-left: 4px solid #28a745; padding: 20px; margin-bottom: 25px; border-radius: 4px;">
                <h2 style="margin: 0 0 10px 0; color: #28a745; font-size: 32px;">
                    ${currency} ${total.toFixed(2)}
                </h2>
                <p style="margin: 0; color: #666; font-size: 16px;">${tripType} flight</p>
                ${savingsText}
            </div>
            
            <!-- Flight Details -->
            <div style="margin-bottom: 25px;">
                
                <!-- Route -->
                <div style="display: flex; align-items: center; margin-bottom: 15px; padding: 15px; background: #f8f9fa; border-radius: 6px;">
                    <div style="text-align: center; flex: 1;">
                        <div style="font-size: 20px; font-weight: bold; color: #333;">${origin}</div>
                        <div style="font-size: 12px; color: #666;">${formatDate(depart)}</div>
                    </div>
                    <div style="flex: 0 0 60px; text-align: center; color: #666;">
                        <div style="font-size: 18px;">✈️</div>
                        <div style="font-size: 10px;">${carrier}</div>
                    </div>
                    <div style="text-align: center; flex: 1;">
                        <div style="font-size: 20px; font-weight: bold; color: #333;">${destination}</div>
                        ${returnDate ? `<div style="font-size: 12px; color: #666;">${formatDate(returnDate)}</div>` : ''}
                    </div>
                </div>
                
                <!-- Flight Info -->
                <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                    <div style="flex: 1; text-align: center; padding: 10px; background: #fff; border: 1px solid #e9ecef; border-radius: 4px;">
                        <div style="font-size: 12px; color: #666; text-transform: uppercase;">Airline</div>
                        <div style="font-weight: bold; color: #333;">${carrier}</div>
                    </div>
                    <div style="flex: 1; text-align: center; padding: 10px; background: #fff; border: 1px solid #e9ecef; border-radius: 4px;">
                        <div style="font-size: 12px; color: #666; text-transform: uppercase;">Outbound</div>
                        <div style="font-weight: bold; color: #333;">${stopsText}</div>
                    </div>
                    ${returnStopsText ? `
                    <div style="flex: 1; text-align: center; padding: 10px; background: #fff; border: 1px solid #e9ecef; border-radius: 4px;">
                        <div style="font-size: 12px; color: #666; text-transform: uppercase;">Return</div>
                        <div style="font-weight: bold; color: #333;">${returnStopsText}</div>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="${deeplinkUrl}" style="display: inline-block; background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                    🔍 View Flight Details
                </a>
            </div>
            
            <!-- Important Notice -->
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 15px; margin-top: 25px;">
                <p style="margin: 0; color: #856404; font-size: 14px;">
                    ⚠️ <strong>Act Fast!</strong> Flight prices change frequently. 
                    This price was found at ${new Date().toLocaleString()} and may no longer be available.
                </p>
            </div>
            
        </div>
        
        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
            <p style="margin: 0; color: #666; font-size: 12px;">
                Travel Orchestrator - Automated Flight Price Monitoring<br>
                This alert was triggered by your price watch for ${origin} → ${destination}
            </p>
        </div>
        
    </div>
</body>
</html>`;
}

/**
 * Generate plain text version of the fare email
 */
export function renderFareEmailText(data: FareEmailData): string {
    const {
        origin,
        destination,
        depart,
        returnDate,
        total,
        currency,
        carrier,
        stops,
        deeplinkUrl,
        targetPrice
    } = data;

    const tripType = returnDate ? 'Round-trip' : 'One-way';
    const stopsText = stops.out === 0 ? 'Non-stop' : `${stops.out} stop${stops.out > 1 ? 's' : ''}`;
    const returnStopsText = returnDate && stops.back !== undefined
        ? (stops.back === 0 ? 'Non-stop' : `${stops.back} stop${stops.back > 1 ? 's' : ''}`)
        : null;

    const savingsText = targetPrice && total < targetPrice
        ? `\n💰 ${currency} ${(targetPrice - total).toFixed(2)} below your target!\n`
        : '';

    return `
✈️ FLIGHT PRICE ALERT ✈️

Great news! We found a deal for you:

${currency} ${total.toFixed(2)} - ${tripType} flight${savingsText}

FLIGHT DETAILS:
Route: ${origin} → ${destination}
Depart: ${depart}${returnDate ? `\nReturn: ${returnDate}` : ''}
Airline: ${carrier}
Outbound: ${stopsText}${returnStopsText ? `\nReturn: ${returnStopsText}` : ''}

VIEW FLIGHT DETAILS:
${deeplinkUrl}

⚠️ ACT FAST! Flight prices change frequently. This price was found at ${new Date().toLocaleString()} and may no longer be available.

---
Travel Orchestrator - Automated Flight Price Monitoring
This alert was triggered by your price watch for ${origin} → ${destination}
`.trim();
}
