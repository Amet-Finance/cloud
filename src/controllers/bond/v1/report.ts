import { Request, Response } from 'express';
import { ReportBody, ReportRawData } from './types';
import connection from '../../../db/main';
import ErrorV1 from '../../../routes/error/error';
import { getAddress, isAddress } from 'ethers';
import { SUPPORTED_CHAINS } from '../../../constants';

async function update(req: Request, res: Response) {
    const { name, telegram, email, description, contractAddress, chainId } = req.body as ReportBody;
    const { address } = req.query;

    const preAddress = address?.toString().toLowerCase();
    const previousDay = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const previousReports = await connection.reports.countDocuments({
        address: preAddress,
        createdAt: { $gt: previousDay },
    });

    if (previousReports > 3) throw ErrorV1.throw('Max Reports Reached For Today');

    const preTelegram = telegram?.trim();
    const preEmail = email?.trim();
    const preDescription = description?.trim();
    const preName = name?.trim();

    if (!preAddress) throw ErrorV1.throw('Address is missing');
    if (!contractAddress || !getAddress(contractAddress)) throw ErrorV1.throw('Invalid Contract Address');
    if (!chainId || !SUPPORTED_CHAINS.includes(chainId)) throw ErrorV1.throw('Invalid Chain');
    if (!preTelegram && !preEmail) throw ErrorV1.throw('Contact Details Missing');
    if (preTelegram && preTelegram.length > 50) throw ErrorV1.throw('Invalid Telegram Handle');
    if (email && email.length > 50) throw ErrorV1.throw('Invalid Email');
    if (!preDescription) throw ErrorV1.throw('Description is Required');
    if (preDescription.length > 300) throw ErrorV1.throw('Description Max Length Reached');

    const report: ReportRawData = {
        contractAddress,
        chainId,
        address: preAddress,
        telegram: preTelegram,
        email: preEmail,
        description: preDescription,
        createdAt: new Date(),
    };

    if (preName) report.name = preName;

    await connection.reports.insertOne(report);

    return res.json({ success: true });
}

const BondReportControllerV1 = { update };

export default BondReportControllerV1;
