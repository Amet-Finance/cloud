import {Db, MongoClient, MongoClientOptions} from 'mongodb';

class Main {
    private _db: Db | null;

    constructor() {
        this._db = null;
    }

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
}

const connection = new Main()
export default connection;
