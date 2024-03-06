import {Collection, Db, Document, MongoClient, MongoClientOptions} from 'mongodb';
import {Address} from "node:cluster";
import {AddressRawData} from "../modules/address/types";
import {ContractRawData} from "../controllers/contract/v2/types";
import {BalanceRawData} from "../modules/balance/types";
import {TokenRawData} from "../modules/token/types";

class Main {
    constructor() {
        this._db = null;
    }

    private _db: Db | null;

    get db(): Db {
        if (!this._db) {
            throw new Error('Database is not connected');
        }
        return this._db;
    }

    async connect(): Promise<void> {
        console.time('Connecting to MongoDB')
        const DB_URI: string = process.env.DB_MAIN_URI as string;
        const DB_NAME: string = process.env.DB_MAIN_NAME as string;
        const client: any = await MongoClient.connect(DB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        } as MongoClientOptions);

        this._db = client.db(DB_NAME);
        console.timeEnd('Connecting to MongoDB')
    }

    get contract(): Collection<ContractRawData> {
        return this.db.collection("Contract")
    }

    get address(): Collection<AddressRawData> {
        return this.db.collection("Address")
    }

    get balance(): Collection<BalanceRawData> {
        return this.db.collection("Balance")
    }

    get token(): Collection<TokenRawData> {
        return this.db.collection(`Token`);
    }

}

const connection = new Main()
export default connection;
