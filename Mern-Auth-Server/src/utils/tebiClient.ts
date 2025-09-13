import { S3Client } from "@aws-sdk/client-s3";

export const tebiS3 = new S3Client({
    region: process.env.TEBI_REGION,
    endpoint: process.env.TEBI_ENDPOINT,
    credentials: {
        accessKeyId: process.env.TEBI_ACCESS_KEY!,
        secretAccessKey: process.env.TEBI_SECRET_KEY!,
    },
    forcePathStyle: false,
});