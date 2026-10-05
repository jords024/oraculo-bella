import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateWheelDelta,
  computeNextZoom,
  calculateFitZoom,
  shouldRenderLine,
  clamp,
  calculateSmoothStep,
  findClosestPageFilename,
  createSmoothScroller
} from './slideWheelHelper.js';

test('calculateWheelDelta handles pixel, line, and page deltaModes with 2.4x speed acceleration', () => {
  // Pixel mode (deltaMode 0) with default 2.4x speed multiplier
  assert.equal(calculateWheelDelta(100, 0), 240);
  assert.equal(calculateWheelDelta(-120, 0), -288);
  assert.equal(calculateWheelDelta(0, 0), 0);

  // Line mode (deltaMode 1) - typical Windows mouse wheel with 2.4x speed
  assert.equal(calculateWheelDelta(3, 1), 3 * 36 * 2.4);
  assert.equal(calculateWheelDelta(-3, 1), -3 * 36 * 2.4);

  // Page mode (deltaMode 2) with 2.4x speed
  assert.equal(calculateWheelDelta(1, 2, 800), 800 * 2.4);
  assert.equal(calculateWheelDelta(-1, 2, 600), -600 * 2.4);
  assert.equal(calculateWheelDelta(1, 2, 50), 100 * 2.4, 'Minimum page size constraint of 100 applied');

  // Custom multiplier support (e.g. 1.0x baseline, 3.0x ultra-fast)
  assert.equal(calculateWheelDelta(100, 0, 400, 1.0), 100);
  assert.equal(calculateWheelDelta(3, 1, 400, 1.0), 108);
  assert.equal(calculateWheelDelta(100, 0, 400, 3.0), 300);
});

test('computeNextZoom increases on wheel up and decreases on wheel down within bounds', () => {
  // Zoom in on deltaY < 0 (wheel rolled upwards)
  assert.equal(computeNextZoom(38, -100), 43);
  assert.equal(computeNextZoom(62, -100), 65, 'Clamped to maxZoom');
  assert.equal(computeNextZoom(65, -100), 65, 'Cannot exceed maxZoom');

  // Zoom out on deltaY > 0 (wheel rolled downwards)
  assert.equal(computeNextZoom(38, 100), 33);
  assert.equal(computeNextZoom(22, 100), 20, 'Clamped to minZoom');
  assert.equal(computeNextZoom(20, 100), 20, 'Cannot go below minZoom');
});

test('clamp respects boundaries', () => {
  assert.equal(clamp(50, 20, 65), 50);
  assert.equal(clamp(10, 20, 65), 20);
  assert.equal(clamp(80, 20, 65), 65);
});

test('calculateSmoothStep smoothly interpolates towards target and snaps on minStep', () => {
  // Interpolation when distance > minStep
  const step1 = calculateSmoothStep(0, 100, 0.2, 0.5);
  assert.equal(step1, 20);

  const step2 = calculateSmoothStep(step1, 100, 0.2, 0.5);
  assert.equal(step2, 36);

  // Snaps to target when within minStep
  const stepDone = calculateSmoothStep(99.6, 100, 0.2, 0.5);
  assert.equal(stepDone, 100);

  const stepDoneNegative = calculateSmoothStep(100.4, 100, 0.2, 0.5);
  assert.equal(stepDoneNegative, 100);
});

test('findClosestPageFilename finds the page closest to container center', () => {
  const container = {
    getBoundingClientRect: () => ({ top: 100, height: 600 }) // Center is 100 + 300 = 400
  };

  const pages = [
    { filename: 'slide-1.png' },
    { filename: 'slide-2.png' },
    { filename: 'slide-3.png' }
  ];

  const pageRefs = {
    'slide-1.png': { getBoundingClientRect: () => ({ top: 0, height: 200 }) }, // Center = 100
    'slide-2.png': { getBoundingClientRect: () => ({ top: 300, height: 200 }) }, // Center = 400 (closest)
    'slide-3.png': { getBoundingClientRect: () => ({ top: 600, height: 200 }) }  // Center = 700
  };

  assert.equal(findClosestPageFilename(pages, pageRefs, container), 'slide-2.png');
  assert.equal(findClosestPageFilename([], pageRefs, container), null);
  assert.equal(findClosestPageFilename(pages, pageRefs, null), null);
});

test('createSmoothScroller accumulates scroll delta and applies updates', () => {
  const mockContainer = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 2000,
    clientHeight: 600,
    scrollWidth: 1000,
    clientWidth: 1000
  };

  const scroller = createSmoothScroller(() => mockContainer, { factor: 0.5 });
  scroller.scrollBy(0, 200);

  // In non-browser environment without requestAnimationFrame, it updates immediately
  assert.equal(mockContainer.scrollTop, 200);

  scroller.scrollBy(0, -50);
  assert.equal(mockContainer.scrollTop, 150);

  scroller.stop();
  assert.equal(scroller.getTarget().top, null);
});

test('calculateFitZoom calculates zoom fitting height and width and respects clamps', () => {
  // Typical laptop: clientHeight 600px, clientWidth 1000px
  // Available height: 600 - 120 = 480. 480 / 1350 = 0.3555 -> 35%
  assert.equal(calculateFitZoom(600, 1000), 35);

  // Smaller vertical space: clientHeight 450px
  // Available height: 450 - 120 = 330. 330 / 1350 = 0.2444 -> 24%
  assert.equal(calculateFitZoom(450, 1000), 24);

  // Large desktop: clientHeight 1200px, clientWidth 1800px
  // Available height: 1080 / 1350 = 0.8 -> clamped to maxZoom 65%
  assert.equal(calculateFitZoom(1200, 1800), 65);

  // Narrow width constraint: clientHeight 800px, clientWidth 300px
  // Available width: 300 - 64 = 236. 236 / 1080 = 0.218 -> 21%
  assert.equal(calculateFitZoom(800, 300), 21);

  // Tiny screen clamped to minZoom (20%)
  assert.equal(calculateFitZoom(200, 200), 20);

  // Missing or invalid container returns default 38%
  assert.equal(calculateFitZoom(0, 0), 38);
  assert.equal(calculateFitZoom(null, null), 38);
  assert.equal(calculateFitZoom(-10, 500), 38);
});

test('shouldRenderLine prevents wrapped overflow lines in single-line and bounded boxes', () => {
  // Single-line box: height 38px, size 34px, lineHeight 1.0 (34px)
  // elementHeight (38) <= lineHeight * 1.4 (47.6) -> isSingleLineBox
  assert.equal(shouldRenderLine(0, 34, 34, 38), true, 'First line renders');
  assert.equal(shouldRenderLine(1, 34, 34, 38), false, 'Second line is blocked from overflowing single-line box');

  // Single-line title: height 52px, size 46px, lineHeight 46px
  assert.equal(shouldRenderLine(0, 46, 46, 52), true);
  assert.equal(shouldRenderLine(1, 46, 46, 52), false);

  // Multi-line box: height 240px, size 40px, lineHeight 48px
  // Allows lines 0, 1, 2, 3 that fit within height 240px
  assert.equal(shouldRenderLine(0, 40, 48, 240), true);
  assert.equal(shouldRenderLine(1, 40, 48, 240), true);
  assert.equal(shouldRenderLine(2, 40, 48, 240), true);
  assert.equal(shouldRenderLine(3, 40, 48, 240), true);
  // Line 5: 5 * 48 + 30 = 270 > 248 -> false
  assert.equal(shouldRenderLine(5, 40, 48, 240), false);
});
