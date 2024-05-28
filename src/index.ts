import './config';
import './tracer';
import './handler';
import cors from 'cors';
import { Response } from 'express';
import connection from './db/main';

import app from './server';
import AddressV1 from './routes/address/v1';
import StatisticsV1 from './routes/statistics/v1';
import TokenV1 from './routes/token/v1';
import BondV1 from './routes/bond/v1';
import ValidateV1 from './routes/validate/v1';
import InitiateCache from './modules/cache';
import InitJobs from './jobs';

app.use(cors());

app.use('/v1/token', TokenV1);

app.use('/v1/bond', BondV1);

app.use('/v1/address', AddressV1);
app.use('/v1/statistics', StatisticsV1);

app.use('/validate', ValidateV1);

app.get('/', (_, res: Response) => res.send('Unlock Financial Possibilities with On-Chain Bonds | Amet Finance'));

console.log(`Starting Amet Finance Cloud | ${new Date().toLocaleTimeString()}`);
connection
    .connect()
    .then(async () => {
        await InitiateCache();
        InitJobs();
        app.listen(process.env.PORT, () => console.log(`Amet Cloud is listening at PORT=${process.env.PORT}| ${new Date().toLocaleTimeString()}`));
    })
    .catch((error) => {
        console.error(`Running failed | ${error.message}`);
        process.exit(1);
    });
