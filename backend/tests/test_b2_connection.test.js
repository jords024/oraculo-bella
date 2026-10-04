/**
 * test_b2_connection.test.js — Teste unitário para validação da conectividade e configuração do Backblaze B2 / S3
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';
import { normalizeEndpoint, getRegionFromEndpoint } from '../dashboard/b2.js';

test('normalizeEndpoint — deve normalizar endpoints B2 para HTTPS sem trailing slash', () => {
  const raw = 'http://s3.us-west-004.backblazeb2.com/';
  const normalized = normalizeEndpoint(raw);
  assert.equal(normalized, 'https://s3.us-west-004.backblazeb2.com');
});

test('getRegionFromEndpoint — deve extrair a região correta a partir da URL do Backblaze', () => {
  const endpoint = 'https://s3.us-west-004.backblazeb2.com';
  const region = getRegionFromEndpoint(endpoint);
  assert.equal(region, 'us-west-004');
});
