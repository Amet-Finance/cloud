import { Request, Response } from 'express';
import { FixedFlexBondController } from 'amet-utils';
import ErrorV1 from '../../../routes/error/error';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { BUCKET_NAME } from '../../../modules/bond-description/constants';
import s3Client from '../../../db/s3-client';
import TokenService from '../../../modules/token';
import BigNumber from 'bignumber.js';

async function update(req: Request, res: Response) {
    const { contractAddress, chainId, title, description } = req.body;
    const { address } = req.query;

    const contract = await FixedFlexBondController.getBondDetails(chainId, contractAddress);

    if (contract.owner.toLowerCase() !== `${address}`.toLowerCase()) ErrorV1.throw('Invalid Owner');
    const _id = `${contractAddress}_${chainId}`.toLowerCase();

    const purchaseToken = await TokenService.get(chainId, contract.purchaseToken);
    const payoutToken = await TokenService.get(chainId, contract.payoutToken);

    const purchaseAmountClean = BigNumber(contract.purchaseAmount).div(BigNumber(10).pow(BigNumber(purchaseToken?.decimals ?? 0)));
    const payoutAmountClean = BigNumber(contract.payoutAmount).div(BigNumber(10).pow(BigNumber(payoutToken?.decimals ?? 0)));

    const metaInfo: any = {
        name: `Amet Finance | ${purchaseToken?.symbol}-${payoutToken?.symbol} | Fixed Flex`,
        description: `This NFT certifies the holder's ownership of an Amet Finance Fixed Flex bond. It signifies a commitment of ${purchaseAmountClean} ${purchaseToken?.symbol} to yield a return of ${payoutAmountClean} ${payoutToken?.symbol} upon maturity. The bond reaches maturity after ${contract.maturityPeriodInBlocks} blocks, symbolizing a reliable investment in the realm of decentralized finance. Issuer: ${contract.owner}.\n\nExercise caution and ensure the authenticity of the token addresses, as token symbols can be subject to imitation. Always confirm the contract details thoroughly to ensure they align with your expectations prior to engaging in any transactions.`,
        external_url: `https://amet.finance/bonds/explore/${chainId}/${contractAddress}`,
        details: {},
    };

    if (title) metaInfo.details.title = title;
    if (description) metaInfo.details.description = description;

    const commandJson = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: `contracts/${_id}.json`,
        Body: JSON.stringify(metaInfo),
        ContentType: 'application/json',
    });

    await s3Client.send(commandJson);
    return res.json(metaInfo);
}

const DescriptionControllerV1 = {
    update,
};

export default DescriptionControllerV1;
