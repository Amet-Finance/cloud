import GraphqlAPI from '../../modules/api/graphql';
import { StringKeyedObject } from '../../types';
import { ethers } from 'ethers';
import { AnyBulkWriteOperation } from 'mongodb';
import connection from '../../db/main';
import { AddressRawData } from '../../modules/address/types';
import BigNumber from 'bignumber.js';
import TokenService from '../../modules/token';
import { AMT_CONTRACT_ADDRESS, SupportedChains } from '../../constants';
import { XpList } from '../../controllers/address/v1/constants';

async function calculateXP() {
    const userXP: StringKeyedObject<number> = {};
    const bulkWriteArray: AnyBulkWriteOperation<AddressRawData>[] = [];

    const users = await connection.address.find({ active: true }).toArray();
    const customRewards = await connection.customRewards.find().toArray();

    const codeToAddress: StringKeyedObject<string> = {};

    for (const user of users) {
        if (!userXP[user._id]) userXP[user._id] = 0;
        if (user.code) codeToAddress[user.code] = user._id;

        userXP[user._id] += user.active ? XpList.JoinXP : 0;
        userXP[user._id] += user.twitter ? XpList.Twitter : 0; // todo check later here if user is following or not
        userXP[user._id] += user.discord?.ametConnected ? XpList.DiscordAmet : 0;
        userXP[user._id] += user.discord?.huntConnected ? XpList.DiscordHunt : 0;
        userXP[user._id] += user.email ? XpList.Email : 0;
    }

    for (const chain of SupportedChains) {
        const { bonds, actionLogs } = await GraphqlAPI.getDataForXP(chain);

        for (const bond of bonds) {
            if (userXP[bond.issuer.id]) {
                userXP[bond.issuer.id] += XpList.IssueBonds;
                if (bond.isSettled) userXP[bond.issuer.id] += XpList.SettleBonds;
            }
        }

        const userPurchaseNativeToken: StringKeyedObject<{ purchaseAMT: number; purchaseCustom: number }> = {};

        for (const log of actionLogs) {
            const { from, to, bond, count } = log;
            const isPurchase = from === ethers.ZeroAddress;

            if (isPurchase && userXP[to]) {
                const token = await TokenService.get(chain, bond.purchaseToken.id, { onlyFromCache: true });
                if (token?.priceUsd) {
                    const priceClean = BigNumber(bond.purchaseAmount)
                        .div(BigNumber(10).pow(BigNumber(token.decimals)))
                        .toNumber();
                    const priceValueUSD: number = Number(count) * priceClean * token.priceUsd;
                    const isAMT = AMT_CONTRACT_ADDRESS[chain].toLowerCase() === bond.payoutToken.id.toLowerCase();

                    if (!userPurchaseNativeToken[to]) {
                        userPurchaseNativeToken[to] = {
                            purchaseAMT: isAMT ? priceValueUSD : 0,
                            purchaseCustom: !isAMT ? priceValueUSD : 0,
                        };
                    } else if (isAMT) {
                        userPurchaseNativeToken[to].purchaseAMT += priceValueUSD;
                    } else {
                        userPurchaseNativeToken[to].purchaseCustom += priceValueUSD;
                    }
                }
            }
        }

        for (const address in userPurchaseNativeToken) {
            const purchaseList = userPurchaseNativeToken[address];

            userXP[address] += Math.floor(purchaseList.purchaseAMT) * XpList.PurchaseAMTBonds;
            userXP[address] += Math.floor(purchaseList.purchaseCustom) * XpList.PurchaseBonds;
        }
    }

    for (const customReward of customRewards) {
        userXP[customReward.address.toLowerCase()] += customReward.reward;
    }

    for (const user of users) {
        if (user.ref) {
            const referrer = codeToAddress[user.ref];
            const points = userXP[user._id];

            userXP[referrer] += (points * XpList.ReferUser) / 100;
        }
    }

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

    if (bulkWriteArray.length) await connection.address.bulkWrite(bulkWriteArray);
}

export { calculateXP };
