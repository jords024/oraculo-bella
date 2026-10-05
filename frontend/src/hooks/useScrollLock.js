import { useEffect } from 'react';

let activeLocks = 0;
let originalOverflow = '';
let originalTouchAction = '';

export const isScrollAllowedTarget = (target) => {
  if (typeof document !== 'undefined' && document.querySelector('.slide-studio')) {
    return true;
  }
  if (!target) return false;
  const isElement = typeof Element !== 'undefined' ? target instanceof Element : typeof target?.closest === 'function';
  const element = isElement ? target : target.parentElement;
  if (!element || typeof element.closest !== 'function') return false;
  return Boolean(
    element.closest('.form-box') ||
    element.closest('.edit-box') ||
    element.closest('.cancel-modal-panel') ||
    element.closest('.modal-content-scroll') ||
    element.closest('.image-details-modal-box') ||
    element.closest('.lib-details-panel') ||
    element.closest('.custom-modal-scroll') ||
    element.closest('.studio-workspace') ||
    element.closest('.studio-panel') ||
    element.closest('.studio-tools') ||
    element.closest('.studio-page-strip') ||
    element.closest('.slide-studio')
  );
};

const handleWheelPrevent = (e) => {
  if (activeLocks <= 0) return;
  if (!isScrollAllowedTarget(e.target)) {
    e.preventDefault();
  }
};

export function useScrollLock(isLocked = true) {
  useEffect(() => {
    if (isLocked) {
      if (activeLocks === 0) {
        originalOverflow = document.body.style.overflow;
        originalTouchAction = document.body.style.touchAction;
        document.body.style.overflow = 'hidden';
        document.body.classList.add('modal-open');
        document.documentElement.classList.add('modal-open');
        window.addEventListener('wheel', handleWheelPrevent, { passive: false });
        window.addEventListener('touchmove', handleWheelPrevent, { passive: false });
      }
      activeLocks++;
    }

    return () => {
      if (isLocked) {
        activeLocks = Math.max(0, activeLocks - 1);
        if (activeLocks === 0) {
          document.body.style.overflow = originalOverflow;
          document.body.style.touchAction = originalTouchAction;
          document.body.classList.remove('modal-open');
          document.documentElement.classList.remove('modal-open');
          window.removeEventListener('wheel', handleWheelPrevent);
          window.removeEventListener('touchmove', handleWheelPrevent);
        }
      }
    };
  }, [isLocked]);
}

export const useLockBodyScroll = useScrollLock;

