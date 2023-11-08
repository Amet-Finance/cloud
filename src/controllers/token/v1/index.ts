import {Request, Response} from "express";
import connection from '../../../db/main'
import {validateAddress} from "./util";
import {TokenResponse} from "../../../modules/web3/type";
import {getTokenInfo} from "../../../listener/zcb";
import {OptionalUnlessRequiredId} from "mongodb";

async function get(req: Request, res: Response) {
    try {
        const {chainId} = req.query as any;
        const contractAddresses = JSON.parse(req.query.contractAddresses as any);

        if (!contractAddresses?.length || !Array.isArray(contractAddresses)) {
            throw Error("Missing Contract Addresses")
        }

        const contractsAddressesLowerCased: any = contractAddresses.map(address => {
            validateAddress(address);
            return address.toLowerCase();
        })


        const addressesInfo = await connection.db.collection(`Token_${Number(chainId)}`).find({
            _id: {
                $in: contractsAddressesLowerCased
            }
        }).toArray()


        const tokenKeyValue: { [key: string]: TokenResponse } = {}

        for (const contractInfo of addressesInfo) {
            const {_id, name, symbol, decimals, icon, isVerified} = contractInfo as any
            tokenKeyValue[_id.toLowerCase()] = {
                name,
                symbol,
                icon,
                decimals,
                isVerified
            }
        }

        const insertInTheDatabase: OptionalUnlessRequiredId<any>[] = []

        for (const contractAddress of contractsAddressesLowerCased) {
            try {
                if (!tokenKeyValue[contractAddress.toLowerCase()]) {
                    const tokenInfo = await getTokenInfo(chainId, contractAddress);
                    if (tokenInfo) {
                        insertInTheDatabase.push(tokenInfo);
                        tokenKeyValue[tokenInfo._id.toLowerCase()] = {
                            isVerified: false,
                            name: tokenInfo.name,
                            symbol: tokenInfo.symbol,
                            decimals: tokenInfo.decimals
                        };
                    }
                }
            } catch (error) {

            }
        }

        if (insertInTheDatabase.length) {
            await connection.db.collection(`Token_${Number(chainId)}`).insertMany(insertInTheDatabase);
        }

        return res.json(tokenKeyValue)
    } catch (error: any) {
        return res.status(400).json({
            message: error.message
        })
    }
}


export {
    get
}
