import { StringKeyedObject } from '../../../types';
import { EmailType } from './type';

const EmailTypes: StringKeyedObject<EmailType> = {
    UpdateEmail: {
        subject: "Confirm Your Email Subscription with Amet Finance",
        body: `<!DOCTYPE html>
                    <html>
                    <head>
                    <title>Confirm Your Subscription</title>
                    </head>
                    <body>
                        <h1>Welcome to Amet Finance!</h1>
                        <p>Thank you for adding your email to receive updates from Amet Finance. We're excited to keep you informed about the latest developments and opportunities.</p>
                        <p>Please click the button below to confirm your email address and complete your subscription:</p>
                        <a href="YOUR_CONFIRMATION_LINK" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px; border-radius: 5px;">Confirm Email</a>
                        <p>If you did not request this subscription, no action is needed.</p>
                        <p>Thank you,<br/>The Amet Finance Team</p>
                    </body>
                    </html>
                    `
    }
}

export {
    EmailTypes
}
