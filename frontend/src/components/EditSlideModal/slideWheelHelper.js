export const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const calculateWheelDelta = (rawDelta, deltaMode, containerSize = 400, multiplier = 2.4) => {
  if (!rawDelta) return 0;
  let baseDelta = rawDelta;
  // deltaMode: 0 = PIXEL, 1 = LINE, 2 = PAGE
  if (deltaMode === 1) {
    baseDelta = rawDelta * 36;
  } else if (deltaMode === 2) {
    baseDelta = rawDelta * Math.max(100, containerSize);
  }
  return baseDelta * multiplier;
};

export const computeNextZoom = (currentZoom, deltaY, minZoom = 20, maxZoom = 65) => {
  const step = deltaY < 0 ? 5 : -5;
  return clamp(currentZoom + step, minZoom, maxZoom);
};

export const calculateFitZoom = (
  containerHeight,
  containerWidth,
  canvasWidth = 1080,
  canvasHeight = 1350,
  options = {}
) => {
  if (!containerHeight || containerHeight <= 0) return 38;
  const verticalPadding = options.verticalPadding ?? 120;
  const horizontalPadding = options.horizontalPadding ?? 64;
  const minZoom = options.minZoom ?? 20;
  const maxZoom = options.maxZoom ?? 65;

  const availableHeight = Math.max(100, containerHeight - verticalPadding);
  const availableWidth = containerWidth && containerWidth > 0
    ? Math.max(100, containerWidth - horizontalPadding)
    : Infinity;

  const heightRatio = availableHeight / canvasHeight;
  const widthRatio = availableWidth / canvasWidth;
  const fitRatio = Math.min(heightRatio, widthRatio);

  const calculatedZoom = Math.floor(fitRatio * 100);
  return clamp(calculatedZoom, minZoom, maxZoom);
};

export const shouldRenderLine = (index, size, lineHeight, elementHeight) => {
  const isSingleLineBox = elementHeight <= lineHeight * 1.4;
  if (isSingleLineBox && index > 0) return false;
  return (index * lineHeight) + (size * 0.75) <= elementHeight + 8;
};

export const calculateSmoothStep = (current, target, factor = 0.22, minStep = 0.5) => {
  const diff = target - current;
  if (Math.abs(diff) <= minStep) return target;
  return current + diff * factor;
};

export const findClosestPageFilename = (pages, pageRefs, container) => {
  if (!pages?.length || !container || typeof container.getBoundingClientRect !== 'function') return null;
  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.top + containerRect.height / 2;

  let closestFilename = null;
  let minDistance = Infinity;

  for (const page of pages) {
    const filename = typeof page === 'string' ? page : page?.filename;
    if (!filename) continue;
    const node = pageRefs?.[filename];
    if (!node || typeof node.getBoundingClientRect !== 'function') continue;
    const rect = node.getBoundingClientRect();
    const pageCenter = rect.top + rect.height / 2;
    const distance = Math.abs(containerCenter - pageCenter);
    if (distance < minDistance) {
      minDistance = distance;
      closestFilename = filename;
    }
  }

  return closestFilename;
};

export function createSmoothScroller(getContainer, { factor = 0.28, minStep = 0.5 } = {}) {
  let targetTop = null;
  let targetLeft = null;
  let rafId = null;

  const stop = () => {
    if (rafId) {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(rafId);
      }
      rafId = null;
    }
    targetTop = null;
    targetLeft = null;
  };

  const sync = () => {
    const container = getContainer();
    if (container) {
      targetTop = container.scrollTop;
      targetLeft = container.scrollLeft;
    }
  };

  const animate = () => {
    const container = getContainer();
    if (!container) {
      stop();
      return;
    }

    let continuing = false;

    if (targetTop !== null) {
      const currentTop = container.scrollTop;
      const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);
      const clampedTarget = Math.max(0, Math.min(maxTop, targetTop));
      const nextTop = calculateSmoothStep(currentTop, clampedTarget, factor, minStep);
      container.scrollTop = nextTop;
      if (Math.abs(nextTop - clampedTarget) > 0.01) {
        continuing = true;
      } else {
        container.scrollTop = clampedTarget;
        targetTop = null;
      }
    }

    if (targetLeft !== null) {
      const currentLeft = container.scrollLeft;
      const maxLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      const clampedTarget = Math.max(0, Math.min(maxLeft, targetLeft));
      const nextLeft = calculateSmoothStep(currentLeft, clampedTarget, factor, minStep);
      container.scrollLeft = nextLeft;
      if (Math.abs(nextLeft - clampedTarget) > 0.01) {
        continuing = true;
      } else {
        container.scrollLeft = clampedTarget;
        targetLeft = null;
      }
    }

    if (continuing) {
      if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(animate);
      } else {
        rafId = null;
      }
    } else {
      rafId = null;
    }
  };

  const scrollBy = (deltaX, deltaY) => {
    const container = getContainer();
    if (!container) return;

    if (deltaY) {
      const maxTop = Math.max(0, container.scrollHeight - container.clientHeight);
      const baseTop = targetTop !== null ? targetTop : container.scrollTop;
      targetTop = Math.max(0, Math.min(maxTop, baseTop + deltaY));
    }

    if (deltaX) {
      const maxLeft = Math.max(0, container.scrollWidth - container.clientWidth);
      const baseLeft = targetLeft !== null ? targetLeft : container.scrollLeft;
      targetLeft = Math.max(0, Math.min(maxLeft, baseLeft + deltaX));
    }

    if (!rafId) {
      if (typeof requestAnimationFrame === 'function') {
        rafId = requestAnimationFrame(animate);
      } else {
        // Fallback for non-browser/test environments
        container.scrollTop = targetTop !== null ? targetTop : container.scrollTop;
        container.scrollLeft = targetLeft !== null ? targetLeft : container.scrollLeft;
        targetTop = null;
        targetLeft = null;
      }
    }
  };

  return {
    scrollBy,
    sync,
    stop,
    getTarget: () => ({ top: targetTop, left: targetLeft })
  };
}
