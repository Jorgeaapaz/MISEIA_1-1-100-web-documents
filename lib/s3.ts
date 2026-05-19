import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl as awsGetSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Readable } from "stream";

const bucket = process.env.AWS_BUCKET!;

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  endpoint: process.env.AWS_URL!,
  credentials: {
    accessKeyId: process.env.AWS_USERNAME!,
    secretAccessKey: process.env.AWS_PASSWORD!,
  },
  forcePathStyle: true,
});

export async function uploadFile(
  key: string,
  body: Buffer | Readable,
  contentType: string
): Promise<void> {
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );
}

export async function getFileStream(key: string): Promise<Readable> {
  const response = await s3.send(
    new GetObjectCommand({ Bucket: bucket, Key: key })
  );
  return response.Body as Readable;
}

export async function deleteFile(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({ Bucket: bucket, Key: key })
  );
}

export async function getSignedUrl(
  key: string,
  expiresIn = 3600
): Promise<string> {
  return awsGetSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucket, Key: key }),
    { expiresIn }
  );
}
