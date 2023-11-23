import {config} from "dotenv";
import "./handler";
import cors from 'cors';
import express, {Response} from 'express';
import connection from './db/main';

import ContractV1 from './routes/contract/v1'
import AddressV1 from './routes/address/v1'
import StatisticsV1 from './routes/statistics/v1'
import BalanceV1 from './routes/balance/v1'
import TokenV1 from './routes/token/v1'
import {CHAINS} from "./modules/web3/constants";
import InitiateCache from "./modules/cache";

config();


const app = express();

// const limiter = rateLimit({
//     windowMs: 60 * 1000, // 15 minutes
//     standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
//     legacyHeaders: false, // Disable the `X-RateLimit-*` headers
// })

// app.use(limiter)
app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.use('/v1/token', TokenV1);
app.use('/v1/address', AddressV1);
app.use('/v1/contract', ContractV1);
app.use('/v1/balance', BalanceV1)
app.use('/v1/statistics', StatisticsV1);

app.get('/', (_, res: Response) => res.send("Unlock Financial Possibilities with On-Chain Bonds | Amet Finance"))

connection.connect()
    .then(async () => {
        await InitiateCache([CHAINS.MantaPacific, CHAINS.Polygon, CHAINS.PolygonZKEVM, CHAINS.Bsc]);

        app.listen(process.env.PORT, () => {
            console.log(`Amet Cloud is listening at PORT=${process.env.PORT}| ${new Date().toLocaleTimeString()}`)
        });
    })
