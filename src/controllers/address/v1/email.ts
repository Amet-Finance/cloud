import { EmailType } from './type';
import { randomUUID } from 'node:crypto';
import { EmailTypes } from './constants';
import nodemailer from 'nodemailer';
import connection from '../../../db/main';

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
    host: 'mail.privateemail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
});

async function updateEmail(address: string, email: string) {
    const addressId = address?.toString().toLowerCase();
    const emailLowercase: string = email.toString().toLowerCase();

    const code = randomUUID();

    await sendEmail(emailLowercase, EmailTypes.UpdateEmail, { code });

    await connection.address.updateOne(
        {
            _id: addressId as any,
        },
        {
            $set: {
                emailCode: code,
                emailPending: emailLowercase,
            },
        },
    );
}

async function sendEmail(to: string, emailType: EmailType, { code }: { code: string }) {
    const { subject, body } = emailType;

    await transporter.sendMail({
        from: user,
        to: to,
        subject: subject,
        html: body.replace('YOUR_CONFIRMATION_LINK', `https://api.amet.finance/validate/email?code=${code}`),
    });
}

const AddressEmailController = {
    updateEmail,
    sendEmail,
};

export default AddressEmailController;
