import "./config";
import "./tracer";
import "./handler";
import cors from 'cors';
import {Response} from 'express';
import connection from './db/main';

import app from "./server";
import AddressV1 from './routes/address/v1'
import DescriptionV1 from './routes/description/v1'
import StatisticsV1 from './routes/statistics/v1'
import TokenV1 from './routes/token/v1'
import InitiateCache from "./modules/cache";
import InitJobs from "./jobs";

app.use(cors())

app.use('/v1/token', TokenV1);
app.use('/v1/description', DescriptionV1);
app.use('/v1/address', AddressV1);
app.use('/v1/statistics', StatisticsV1);

app.get('/', (_, res: Response) => res.send("Unlock Financial Possibilities with On-Chain Bonds | Amet Finance"))

connection.connect()
    .then(async () => {
        await InitiateCache();
        InitJobs();
        app.listen(process.env.PORT, () => console.log(`Amet Cloud is listening at PORT=${process.env.PORT}| ${new Date().toLocaleTimeString()}`))
    })
