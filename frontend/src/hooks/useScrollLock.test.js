import assert from 'node:assert/strict';
import test from 'node:test';
import { isScrollAllowedTarget } from './useScrollLock.js';

test('isScrollAllowedTarget correctly identifies scrollable areas inside SlideStudio and other modals', () => {
  const createMockElement = (matchesClass) => ({
    closest: (selector) => {
      const selectors = selector.split(',').map(s => s.trim());
      for (const sel of selectors) {
        if (sel === `.${matchesClass}`) {
          return { className: matchesClass };
        }
      }
      return null;
    }
  });

  // Áreas dentro do SlideStudio que devem permitir rolagem normal
  assert.equal(isScrollAllowedTarget(createMockElement('studio-workspace')), true, 'studio-workspace deve permitir scroll');
  assert.equal(isScrollAllowedTarget(createMockElement('studio-panel')), true, 'studio-panel deve permitir scroll');
  assert.equal(isScrollAllowedTarget(createMockElement('studio-tools')), true, 'studio-tools deve permitir scroll');
  assert.equal(isScrollAllowedTarget(createMockElement('studio-page-strip')), true, 'studio-page-strip deve permitir scroll');
  assert.equal(isScrollAllowedTarget(createMockElement('slide-studio')), true, 'slide-studio container geral deve permitir scroll');

  // Modais já existentes
  assert.equal(isScrollAllowedTarget(createMockElement('form-box')), true, 'form-box deve permitir scroll');
  assert.equal(isScrollAllowedTarget(createMockElement('edit-box')), true, 'edit-box deve permitir scroll');

  // Elementos fora das áreas roláveis (ex: backdrop, body, overlay)
  assert.equal(isScrollAllowedTarget(createMockElement('backdrop-overlay')), false, 'backdrop não deve rolar a página por baixo');
  assert.equal(isScrollAllowedTarget(createMockElement('random-element')), false, 'elementos soltos não devem rolar a página por baixo');
  assert.equal(isScrollAllowedTarget(null), false, 'target nulo deve retornar false');
  assert.equal(isScrollAllowedTarget({}), false, 'target sem função closest deve retornar false');

  // Suporte a nós filhos (como nós de texto) resolvendo para parentElement
  const textNodeMock = {
    parentElement: createMockElement('studio-workspace')
  };
  assert.equal(isScrollAllowedTarget(textNodeMock), true, 'Nó de texto dentro de studio-workspace deve permitir scroll via parentElement');

  // Quando .slide-studio está no DOM, scroll é liberado globalmente
  globalThis.document = {
    querySelector: (sel) => sel === '.slide-studio' ? {} : null
  };
  assert.equal(isScrollAllowedTarget(createMockElement('random-element')), true, 'Se .slide-studio está no DOM, libera scroll');
  delete globalThis.document;
});

