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
let rawEndpoint = getEnv('R2_ENDPOINT') || getEnv('AWS_S3_ENDPOINT_URL');

let endpoint: string | undefined = undefined;

if (rawEndpoint) {
    // Ensure protocol
    let urlString = rawEndpoint.startsWith('http') ? rawEndpoint : `https://${rawEndpoint}`;
    try {
        const url = new URL(urlString);
        // Strip path (e.g., /r2bucket-dudol) - Cloudflare R2 endpoint must be the host only
        endpoint = `${url.protocol}//${url.host}`;
        console.log(`R2 Endpoint configured: ${endpoint}`);
    } catch (e) {
        console.error(`Invalid R2_ENDPOINT provided: ${rawEndpoint}`);
    }
} else if (r2AccountId) {
    endpoint = `https://${r2AccountId}.r2.cloudflarestorage.com`;
    console.log(`R2 Endpoint constructed from Account ID: ${endpoint}`);
}

if (!endpoint) {
    console.warn('WARNING: R2 Endpoint is not configured. S3 client will fallback to default AWS endpoints, which may cause ENOTFOUND errors.');
}

export const r2 = new S3Client({
    region: getEnv('R2_S3_REGION') || getEnv('AWS_S3_REGION') || 'auto',
    endpoint: endpoint,
    forcePathStyle: true, // Crucial for Cloudflare R2 compatibility
    credentials: {
        accessKeyId: accessKeyId || '',
        secretAccessKey: secretAccessKey || '',
    },
});

export const R2_BUCKET = getEnv('R2_S3_BUCKET') || getEnv('AWS_S3_BUCKET') || getEnv('R2_BUCKET_NAME') || 'r2bucket-dudol';
export const R2_PUBLIC_DOMAIN = getEnv('R2_PUBLIC_DOMAIN');
