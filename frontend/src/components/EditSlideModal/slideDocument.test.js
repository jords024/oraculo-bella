import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveImageSource, createSlideDocument } from './slideDocument.js';

test('resolveImageSource correctly resolves raw background and preserves custom assets', () => {
  const rawUrl = '/api/carousels/carrossel-03/image/raw-01.jpg?token=abc';

  // Background with empty src should receive rawImageUrl
  const bgEmpty = { id: 'background', type: 'image', src: '' };
  assert.equal(resolveImageSource(bgEmpty, rawUrl), rawUrl);

  // Background with outdated raw link should be refreshed to valid rawImageUrl
  const bgOutdated = { id: 'background', type: 'image', src: '/api/carousels/carrossel-03-slug/image/raw-01.jpg' };
  assert.equal(resolveImageSource(bgOutdated, rawUrl), rawUrl);

  // Custom user uploaded or library image as background should be preserved
  const bgCustom = { id: 'background', type: 'image', src: '/api/library/foto-acervo.jpg' };
  assert.equal(resolveImageSource(bgCustom, rawUrl), '/api/library/foto-acervo.jpg');

  // Element with sourceRole raw should always resolve to rawImageUrl
  const elementRaw = { id: 'layer-1', type: 'image', sourceRole: 'raw', src: '' };
  assert.equal(resolveImageSource(elementRaw, rawUrl), rawUrl);

  // Non-image elements return unchanged src
  const textElement = { id: 'text-1', type: 'text', src: undefined };
  assert.equal(resolveImageSource(textElement, rawUrl), undefined);
});

test('createSlideDocument applies valid image sources to all elements', () => {
  const rawUrl = '/api/carousels/carrossel-03/image/raw-01.jpg';
  const meta = {
    design: {
      version: 1,
      elements: [
        { id: 'background', type: 'image', src: '/api/carousels/old-slug/image/raw-01.jpg' },
        { id: 'title', type: 'text', content: 'Olá' }
      ]
    }
  };

  const doc = createSlideDocument(meta, rawUrl);
  assert.equal(doc.elements[0].src, rawUrl);
  assert.equal(doc.elements[1].content, 'Olá');
});
