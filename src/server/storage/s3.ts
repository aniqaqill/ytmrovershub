import {S3Client} from '@aws-sdk/client-s3';
import { env } from '~/env';

const endpoint = env.s3_endpoint;
const region = "ap-southeast-1"
const accessKey = env.s3_access_key;
const secretKey = env.s3_secret_access;


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