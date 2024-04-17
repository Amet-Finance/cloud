import GraphqlAPI from '../../modules/api/graphql';
import { CHAINS } from 'amet-utils';
import { StringKeyedObject } from '../../types';
import { ethers } from 'ethers';
import { AnyBulkWriteOperation } from 'mongodb';
import connection from '../../db/main';
import { AddressRawData } from '../../modules/address/types';

async function calculateXP() {
    const xpList = {
        Issuance: 10,
        Purchase: 1,
        Redeem: 2,
    };

    const userBalances: StringKeyedObject<number> = {};

    const { bonds, actionLogs } = await GraphqlAPI.getDataForXP(CHAINS.Base);

    for (const bond of bonds) {
        if (!userBalances[bond.issuer.id]) userBalances[bond.issuer.id] = 0;
        userBalances[bond.issuer.id] += xpList.Issuance;
    }

    for (const log of actionLogs) {
        if (!userBalances[log.from]) userBalances[log.from] = 0;
        if (!userBalances[log.to]) userBalances[log.to] = 0;

        if (log.from === ethers.ZeroAddress) {
            log.to += xpList.Purchase;
        } else if (log.to === ethers.ZeroAddress) {
            log.from += xpList.Redeem;
        }
    }

    const bulkWriteArray: AnyBulkWriteOperation<AddressRawData>[] = [];

    delete userBalances[ethers.ZeroAddress];

    for (const address in userBalances) {
        bulkWriteArray.push({
            updateOne: {
                filter: {
                    _id: address.toLowerCase() as any,
                },
                update: {
                    $set: {
                        xp: userBalances[address],
                    },
                },
                upsert: true,
            },
        });
    }

    if (bulkWriteArray.length) {
        await connection.address.bulkWrite(bulkWriteArray);
    }
}

export { calculateXP };
