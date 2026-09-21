// dashboard/b2.js — Backblaze B2 client (S3-compatible)
// Usado em produção para armazenar carousels.json e imagens

import { S3Client, GetObjectCommand, PutObjectCommand, ListObjectsV2Command, CreateBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
import fs from "fs";
import path from "path";
import { Readable } from "stream";
import { logger } from "./logger.js";

// ── Config ──────────────────────────────────────────────────────────────────
const BUCKET      = process.env.MINIO_BUCKET      || process.env.B2_BUCKET || "oraculo-bucket";
const RAW_ENDPOINT = process.env.MINIO_ENDPOINT    || process.env.B2_ENDPOINT || "http://localhost:9000";
const KEY_ID      = process.env.MINIO_ROOT_USER   || process.env.B2_KEY_ID || process.env.B2_APPLICATION_KEY_ID || "oraculo_admin";
const APP_KEY     = process.env.MINIO_ROOT_PASSWORD || process.env.B2_APP_KEY || process.env.B2_APPLICATION_KEY || "oraculo_secret_123";
const PREFIX      = "carousels";  // pasta raiz no bucket

export function normalizeEndpoint(raw) {
  if (!raw) return "http://localhost:9000";
  let ep = String(raw).trim();
  if (!ep.startsWith("http://") && !ep.startsWith("https://")) {
    if (ep.includes("localhost") || ep.includes("minio") || ep.includes("127.0.0.1") || ep.includes(":9000")) {
      ep = `http://${ep}`;
    } else {
      ep = `https://${ep}`;
    }
  } else if (ep.startsWith("http://") && (ep.includes("backblazeb2.com") || ep.includes("amazonaws.com") || ep.includes("r2.cloudflarestorage.com"))) {
    // Evita redirecionamento HTTP 301 "Moved Permanently" da nuvem
    ep = ep.replace(/^http:\/\//i, "https://");
  }
  return ep.replace(/\/+$/, "");
}

export function getRegionFromEndpoint(endpoint) {
  if (process.env.MINIO_REGION || process.env.AWS_REGION || process.env.B2_REGION) {
    return process.env.MINIO_REGION || process.env.AWS_REGION || process.env.B2_REGION;
  }
  const match = endpoint.match(/s3[.-]([a-z0-9-]+)\.backblazeb2\.com/i);
  if (match) return match[1];
  const awsMatch = endpoint.match(/s3[.-]([a-z0-9-]+)\.amazonaws\.com/i);
  if (awsMatch) return awsMatch[1];
  return "us-east-1";
}

const ENDPOINT = normalizeEndpoint(RAW_ENDPOINT);

// URL pública base para acesso (com fallback)
const MINIO_PUBLIC_URL = normalizeEndpoint(process.env.MINIO_PUBLIC_URL || ENDPOINT);
export const B2_PUBLIC_URL = `${MINIO_PUBLIC_URL}/${BUCKET}`;

// ── Client ──────────────────────────────────────────────────────────────────
let _client = null;
let _bucketInitialized = false;

export function getClient() {
  if (!_client) {
    const region = getRegionFromEndpoint(ENDPOINT);
    _client = new S3Client({
      region: region,
      endpoint: ENDPOINT,
      credentials: { accessKeyId: KEY_ID, secretAccessKey: APP_KEY },
      forcePathStyle: true,
    });
  }
  return _client;
}

export async function ensureBucketExists() {
  if (_bucketInitialized) return;
  _bucketInitialized = true;

  const isCloudProvider = ENDPOINT.includes("backblazeb2.com") || ENDPOINT.includes("r2.cloudflarestorage.com");
  const client = getClient();

  // Em provedores de nuvem como Backblaze B2, a criação e permissões do bucket são gerenciadas no console do provedor
  if (!isCloudProvider) {
    try {
      const cmd = new CreateBucketCommand({ Bucket: BUCKET });
      await client.send(cmd);
      logger.info('[B2]', `Bucket "${BUCKET}" criado ou verificado com sucesso.`);
    } catch (e) {
      if (e.name !== "BucketAlreadyExists" && e.name !== "BucketAlreadyOwnedByYou" && e.code !== "BucketAlreadyExists") {
        logger.warn('[B2]', `Aviso ao criar bucket "${BUCKET}": ${e.message}`);
      }
    }

    try {
      const policy = JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicRead",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${BUCKET}/*`]
          }
        ]
      });
      await client.send(new PutBucketPolicyCommand({ Bucket: BUCKET, Policy: policy }));
      logger.info('[B2]', `Política pública de leitura configurada no bucket "${BUCKET}".`);
    } catch (policyErr) {
      logger.warn('[B2]', `Aviso ao configurar política no bucket: ${policyErr.message}`);
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on("data", chunk => chunks.push(chunk));
    stream.on("end",  () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

// ── carousels.json ──────────────────────────────────────────────────────────
const DATA_KEY = `${PREFIX}/carousels.json`;

export async function readDataFromB2() {
  try {
    await ensureBucketExists();
    const cmd = new GetObjectCommand({ Bucket: BUCKET, Key: DATA_KEY });
    const res = await getClient().send(cmd);
    const buf = await streamToBuffer(res.Body);
    return JSON.parse(buf.toString("utf-8"));
  } catch (e) {
    if (e.name === "NoSuchKey" || e.$metadata?.httpStatusCode === 404) return [];
    logger.warn('[B2]', `Aviso ao ler carousels.json do B2/MinIO (${e.message}), retornando lista vazia.`);
    return [];
  }
}

export async function writeDataToB2(data) {
  try {
    await ensureBucketExists();
    const body = JSON.stringify(data, null, 2);
    const cmd = new PutObjectCommand({
      Bucket: BUCKET,
      Key: DATA_KEY,
      Body: body,
      ContentType: "application/json",
    });
    await getClient().send(cmd);
  } catch (e) {
    logger.warn('[B2]', `Aviso ao escrever carousels.json no B2/MinIO: ${e.message}`);
  }
}

// ── Images ───────────────────────────────────────────────────────────────────
export function b2ImageUrl(carouselId, filename) {
  return `${B2_PUBLIC_URL}/${PREFIX}/${carouselId}/${filename}`;
}

export async function uploadImageToB2(carouselId, filename, filePath) {
  await ensureBucketExists();
  const body = fs.readFileSync(filePath);
  const ext  = path.extname(filename).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  const cmd  = new PutObjectCommand({
    Bucket: BUCKET,
    Key: `${PREFIX}/${carouselId}/${filename}`,
    Body: body,
    ContentType: mime,
  });
  await getClient().send(cmd);
  return b2ImageUrl(carouselId, filename);
}

export async function downloadImageFromB2(carouselId, filename, destPath) {
  await ensureBucketExists();
  const cmd = new GetObjectCommand({
    Bucket: BUCKET,
    Key: `${PREFIX}/${carouselId}/${filename}`,
  });
  const res = await getClient().send(cmd);
  const buf = await streamToBuffer(res.Body);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
}

export async function listImagesInB2(carouselId) {
  await ensureBucketExists();
  const cmd = new ListObjectsV2Command({
    Bucket: BUCKET,
    Prefix: `${PREFIX}/${carouselId}/`,
  });
  const res = await getClient().send(cmd);
  return (res.Contents || [])
    .map(obj => path.basename(obj.Key))
    .filter(f => /\.(jpg|jpeg|png)$/i.test(f))
    .sort();
}

// ── Streaming proxy ──────────────────────────────────────────────────────────
// Retorna um stream legível da imagem diretamente do MinIO.
// Usado pelo backend para fazer proxy sem redirecionar o browser para URL interna.
export async function getImageStream(carouselId, filename) {
  const cmd = new GetObjectCommand({
    Bucket: BUCKET,
    Key: `${PREFIX}/${carouselId}/${filename}`,
  });
  const res = await getClient().send(cmd);
  return res.Body;
}

export function isB2Configured() {
  return !!(KEY_ID && APP_KEY && BUCKET && ENDPOINT);
}
