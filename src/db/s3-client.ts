import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: process.env.S3_ACCESS as any,
        secretAccessKey: process.env.S3_SECRET as any,
    },
});

export default s3Client;
