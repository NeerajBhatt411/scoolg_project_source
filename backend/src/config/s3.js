import 'dotenv/config';
import { S3Client } from '@aws-sdk/client-s3';

// AWS S3 config for image/file uploads. Enabled only when all four env vars are
// present — otherwise the upload controller falls back to Cloudinary, so nothing
// breaks if the keys aren't set (e.g. on an environment still on Cloudinary).
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET } = process.env;

export const s3Enabled = !!(AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY && AWS_REGION && S3_BUCKET);

export const s3Client = s3Enabled
    ? new S3Client({
        region: AWS_REGION,
        credentials: { accessKeyId: AWS_ACCESS_KEY_ID, secretAccessKey: AWS_SECRET_ACCESS_KEY },
    })
    : null;

export const s3Bucket = S3_BUCKET;
export const s3Region = AWS_REGION;

if (s3Enabled) console.log(`✅ S3 uploads enabled (bucket: ${S3_BUCKET}, region: ${AWS_REGION})`);
else console.log('ℹ️ S3 not configured — uploads will use Cloudinary.');
