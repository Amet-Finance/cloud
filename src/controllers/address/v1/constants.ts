import { StringKeyedObject } from '../../../types';
import { EmailType } from './type';

const XpList = {
    JoinXP: 50,
    ReferUser: 10, // percent
    Donate: 20, // per $1 value

    Twitter: 50,
    Discord: 50,
    Email: 50,

    IssueBonds: 500,
    SettleBonds: 100,

    PurchaseBonds: 40, // per $1 value
    PurchaseAMTBonds: 60, // per $1 value
    ReferUsersPurchase: 5, // per $1 value

    CommunityContribution: 0, // up to 500
    ParticipationInPolls: 20, // per event
    FeedbackImplementation: 0, // up to 200
    SpecialChallenges: 0, // up to 500
    VideTutorial: 0, // up to 1000
};

const EmailTypes: StringKeyedObject<EmailType> = {
    UpdateEmail: {
        subject: 'Confirm Your Email Subscription with Amet Finance',
        body: `<!DOCTYPE html>
                        <html>
                        <head>
                            <title>Confirm Your Subscription</title>
                            <style>
                                a:hover {
                                    background-color: rgb(38, 38, 38);
                                }
                            </style>
                        </head>
                        <body style="display: flex; flex-direction: column; gap: 1rem;">
                        <h1 style="font-size: xx-large">Welcome to Amet Finance!</h1>
                        <p style="font-size: 0.9rem; color: #212121">Thank you for adding your email to receive updates from Amet Finance. We're
                            excited to keep you informed about the latest developments and opportunities.</p>
                        <p style="font-size: 0.9rem; color: #212121">Please click the button below to confirm your email address and complete
                            your subscription:</p>
                        <a href="YOUR_CONFIRMATION_LINK"
                           style="background-color: rgb(23, 23, 23); color: white; padding: 0.5rem 2rem; text-align: center; text-decoration: none; display: flex; justify-content: center; align-items: center; font-size: 16px; border-radius: 5px;">Confirm
                            Email</a>
                        <p style="font-size: 0.9rem; color: #212121">If you did not request this subscription, no action is needed.</p>
                        <p style="font-size: 0.9rem; color: #212121">Thank you,<br />Amet Finance Team</p>
                        </body>
                        </html>

                    `,
    },
};

export { XpList, EmailTypes };
