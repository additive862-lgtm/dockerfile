import { S3Client } from '@aws-sdk/client-s3';

// Use names matching the user's CloudType/GitHub Actions settings
const accessKeyId = process.env.AWS_ACCESS_KEY || process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_KEY || process.env.R2_SECRET_ACCESS_KEY;
const endpoint = process.env.AWS_S3_ENDPOINT_URL || (process.env.R2_ACCOUNT_ID ? `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined);

export const r2 = new S3Client({
    region: process.env.AWS_S3_REGION || 'auto',
    endpoint: endpoint,
    credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
    },
});

export const R2_BUCKET = process.env.AWS_S3_BUCKET || process.env.R2_BUCKET_NAME || 'r2bucket-dudol';
export const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN; 
