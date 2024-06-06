import connection from '../../db/main';
import { AnyBulkWriteOperation } from 'mongodb';
import { ethers } from 'ethers';
import { Erc20Controller, ProviderController } from 'amet-utils';
import BigNumber from 'bignumber.js';
import TokenService from '../../modules/token';

export default async function calculatePricesFromDexs() {
    const tokens = await connection.token.find({ uniV3: { $exists: true } }).toArray();

    const bulkWrites: AnyBulkWriteOperation[] = [];

    for (const token of tokens) {
        if (token.uniV3) {
            const [quoteContractAddress, priceInQuote] = await calculateUniswapV3Price(token.uniV3, token.chainId);

            const quoteToken = await TokenService.get(token.chainId, quoteContractAddress);
            if (quoteToken?.priceUsd) {
                const priceUsd = priceInQuote.times(BigNumber(quoteToken.priceUsd)).toNumber();

                bulkWrites.push({
                    updateOne: {
                        filter: {
                            _id: token._id as any,
                        },
                        update: {
                            $set: {
                                priceUsd: priceUsd,
                            },
                        },
                        upsert: true,
                    },
                });
            }
        }
    }

    if (bulkWrites.length) await connection.token.bulkWrite(bulkWrites as any);
}

async function calculateUniswapV3Price(contractAddress: string, chainId: number): Promise<[string, BigNumber]> {
    const { provider } = new ProviderController(chainId);

    const poolAbi = [
        'function slot0() external view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint8 feeProtocol, bool unlocked)',
        'function token0() external view returns (address)',
        'function token1() external view returns (address)',
    ];

    const poolContract = new ethers.Contract(contractAddress, poolAbi, provider as any);
    const token0Address = await poolContract.token0();
    const token1Address = await poolContract.token1();

    const token0Details = await Erc20Controller.getTokenDetails(chainId, token0Address, false, provider);
    const token1Details = await Erc20Controller.getTokenDetails(chainId, token1Address, false, provider);

    const slot0 = await poolContract.slot0();
    const sqrtPriceX96 = slot0.sqrtPriceX96;

    const price = BigNumber(sqrtPriceX96)
        .div(BigNumber(2).pow(BigNumber(96)))
        .pow(BigNumber(2));

    let buyOneOfToken0 = price.div(
        BigNumber(10)
            .pow(BigNumber(token1Details.decimals))
            .div(BigNumber(10).pow(BigNumber(token0Details.decimals))),
    );
    let buyOneOfToken1 = BigNumber(1).div(buyOneOfToken0);

    return [token0Address.toLowerCase(), buyOneOfToken1];
}
