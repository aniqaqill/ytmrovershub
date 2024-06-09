import {S3Client} from '@aws-sdk/client-s3';
import { env } from '~/env';

const endpoint = env.NEXT_PUBLIC_s3_endpoint
const region = "ap-southeast-1"
const accessKey = env.NEXT_PUBLIC_s3_access_key
const secretKey = env.NEXT_PUBLIC_s3_secret_access;


const s3Client = new S3Client({
  forcePathStyle: true,
  region,
  endpoint,
  // bucketEndpoint: true,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  }
});

export default s3Client;