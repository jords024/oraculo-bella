import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.MINIO_ROOT_USER || "oraculo_admin",
    secretAccessKey: process.env.MINIO_ROOT_PASSWORD || "oraculo_secret_123",
  },
  forcePathStyle: true,
});

async function run() {
  try {
    const bucket = process.env.MINIO_BUCKET || "oraculo";
    console.log(`Listing objects in bucket: ${bucket}`);
    const res = await s3.send(new ListObjectsV2Command({
      Bucket: bucket,
    }));
    
    if (!res.Contents) {
      console.log("No objects found.");
      return;
    }
    
    console.log("Objects:");
    res.Contents.forEach(c => {
      console.log(`- ${c.Key} (${c.Size} bytes)`);
    });
  } catch (err) {
    console.error("Error listing objects:", err);
  }
}

run();
