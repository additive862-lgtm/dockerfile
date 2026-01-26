import { S3Client } from '@aws-sdk/client-s3';

// Use names matching the user's CloudType/GitHub Actions settings
// Helper to get env var and ensure it's a clean string
const getEnv = (key: string) => {
    const val = process.env[key];
    return (val && val.trim().length > 0) ? val.trim() : undefined;
};

const accessKeyId = getEnv('R2_ACCESS_KEY') || getEnv('R2_ACCESS_KEY_ID') || getEnv('AWS_ACCESS_KEY');
const secretAccessKey = getEnv('R2_SECRET_KEY') || getEnv('R2_SECRET_ACCESS_KEY') || getEnv('AWS_SECRET_KEY');
const r2AccountId = getEnv('R2_ACCOUNT_ID');
let customEndpoint = getEnv('AWS_S3_ENDPOINT_URL');

// Force fix customEndpoint if it's just the account ID or missing https
if (customEndpoint && !customEndpoint.startsWith('http')) {
    customEndpoint = `https://${customEndpoint}`;
    if (!customEndpoint.includes('.r2.cloudflarestorage.com')) {
        customEndpoint = `${customEndpoint}.r2.cloudflarestorage.com`;
    }
}

const endpoint = customEndpoint || (r2AccountId ? `https://${r2AccountId}.r2.cloudflarestorage.com` : undefined);

export const r2 = new S3Client({
    region: getEnv('R2_S3_REGION') || getEnv('AWS_S3_REGION') || 'auto',
    endpoint: endpoint,
    credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
    },
});

export const R2_BUCKET = getEnv('R2_S3_BUCKET') || getEnv('AWS_S3_BUCKET') || getEnv('R2_BUCKET_NAME') || 'r2bucket-dudol';
export const R2_PUBLIC_DOMAIN = getEnv('R2_PUBLIC_DOMAIN');
