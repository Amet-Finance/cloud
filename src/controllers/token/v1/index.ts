import {Request, Response} from "express";
import connection from '../../../db/main'
import {generateTokenResponse, validateAddress} from "./util";
import {TokenResponse} from "../../../modules/web3/type";
import {getTokenInfo} from "../../../listener/zcb";
import {OptionalUnlessRequiredId} from "mongodb";
import {getBalance} from "../../../listener/zcb/token";

async function get(req: Request, res: Response) {
    try {
        // todo implement here security checks as well
        const {chainId, contractAddresses, returnBalance, address} = req.query as any;
        const requestBalance = returnBalance === "true" && address;

        if (!contractAddresses?.length || !Array.isArray(contractAddresses)) {
            throw Error("Missing Contract Addresses")
        }

        if (contractAddresses.length > 50) {
            throw Error("Too Many Contract Addresses")
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
            const contractAddress = contractInfo._id.toString().toLowerCase()
            tokenKeyValue[contractAddress] = generateTokenResponse(chainId, contractInfo)
        }

        const insertInTheDatabase: OptionalUnlessRequiredId<any>[] = []

        for (const contractAddress of contractsAddressesLowerCased) {
            try {
                if (!tokenKeyValue[contractAddress.toLowerCase()]) {
                    const tokenInfo = await getTokenInfo(chainId, contractAddress);
                    if (tokenInfo) {
                        insertInTheDatabase.push(tokenInfo);
                        tokenKeyValue[tokenInfo._id.toLowerCase()] = generateTokenResponse(chainId, tokenInfo)
                    }
                }
            } catch (error) {

            }
        }

        if (insertInTheDatabase.length) {
            await connection.db.collection(`Token_${Number(chainId)}`).insertMany(insertInTheDatabase);
        }

        if (requestBalance) {
            for (const contractAddress in tokenKeyValue) {
                const balance = await getBalance(chainId, contractAddress, address, tokenKeyValue[contractAddress].decimals)
                tokenKeyValue[contractAddress] = {
                    ...tokenKeyValue[contractAddress],
                    ...balance
                }
            }
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
