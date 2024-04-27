import GraphqlAPI from '../../modules/api/graphql';
import { CHAINS } from 'amet-utils';
import { StringKeyedObject } from '../../types';
import { ethers } from 'ethers';
import { AnyBulkWriteOperation } from 'mongodb';
import connection from '../../db/main';
import { AddressRawData } from '../../modules/address/types';
import BigNumber from 'bignumber.js';
import TokenService from '../../modules/token';
import { AMT_CONTRACT_ADDRESS } from '../../constants';

async function calculateXP() {
    const chain = CHAINS.Base;
    const xpList = {
        JoinXP: 50,
        ReferUser: 10, // percent

        Twitter: 50,
        Discord: 50,

        IssueBonds: 500,
        SettleBonds: 20,
        CompleteRedemption: 8, // per $1 value

        PurchaseBonds: 6, // per $1 value
        PurchaseAMTBonds: 10, // per $1 value
        ReferUsersPurchase: 3, // per $1 value
    };

    const userXP: StringKeyedObject<number> = {};

    const { bonds, actionLogs } = await GraphqlAPI.getDataForXP(chain);
    const users = await connection.address.find({ active: true }).toArray();

    for (const user of users) {
        if (!userXP[user._id]) userXP[user._id] = 0;

        userXP[user._id] += user.active ? xpList.JoinXP : 0;
        userXP[user._id] += user.twitter ? xpList.Twitter : 0; // todo check later here if user is following or not
        userXP[user._id] += user.discord ? xpList.Discord : 0;
    }

    for (const bond of bonds) {
        if (userXP[bond.issuer.id]) {
            userXP[bond.issuer.id] += xpList.IssueBonds;
            if (bond.isSettled) userXP[bond.issuer.id] += xpList.SettleBonds;
        }
    }

    for (const log of actionLogs) {
        const { from, to, bond, count } = log;
        if (from === ethers.ZeroAddress) {
            if (userXP[to]) {
                const token = await TokenService.get(
                    chain,
                    bond.purchaseToken.id,
                    { onlyFromCache: true },
                );
                if (token?.priceUsd) {
                    const priceClean = BigNumber(bond.purchaseAmount)
                        .div(BigNumber(10).pow(BigNumber(token.decimals)))
                        .toNumber();
                    const priceValueUSD: number =
                        Number(count) * priceClean * token.priceUsd;
                    const isAMT =
                        AMT_CONTRACT_ADDRESS[chain].toLowerCase() ===
                        token.contractAddress.toLowerCase();
                    userXP[to] +=
                        Math.floor(priceValueUSD) *
                        (isAMT
                            ? xpList.PurchaseAMTBonds
                            : xpList.PurchaseBonds);
                }
            }
        }
    }

    const bulkWriteArray: AnyBulkWriteOperation<AddressRawData>[] = [];

    for (const address in userXP) {
        bulkWriteArray.push({
            updateOne: {
                filter: {
                    _id: address.toLowerCase() as any,
                },
                update: {
                    $set: {
                        xp: userXP[address],
                        lastUpdated: new Date(),
                    },
                },
            },
        });
    }

    if (bulkWriteArray.length) {
        await connection.address.bulkWrite(bulkWriteArray);
    }
}

export { calculateXP };
