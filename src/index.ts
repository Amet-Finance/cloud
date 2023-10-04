import "./handler";
import cors from 'cors';
import {config} from "dotenv";
import express from 'express';
import connection from './db/main';
import BlockchainListener from './listener/index';
import ContractV1 from './routes/contract/v1'
import StatisticsV1 from './routes/statistics/v1'
import BalanceV1 from './routes/balance/v1'
import {CHAINS} from "./modules/web3/constants";

config();

const app = express();

app.use(cors());

app.use('/v1/contract', ContractV1);
app.use('/v1/balance', BalanceV1)
app.use('/v1/statistics', StatisticsV1);

connection.connect()
    .then(async () => {
        await BlockchainListener(CHAINS.Mumbai);
        app.listen(process.env.PORT, () => {
            console.log(`Amet Cloud is listening at PORT=${process.env.PORT}| ${new Date().toLocaleTimeString()}`)
        });
    })