import { useEffect } from 'react';

let activeLocks = 0;
let originalOverflow = '';
let originalTouchAction = '';

const handleWheelPrevent = (e) => {
  if (activeLocks <= 0) return;
  const target = e.target;
  // Permite scroll somente se estiver dentro de uma área rolável do modal
  const insideScrollable = target && (
    target.closest('.form-box') ||
    target.closest('.edit-box') ||
    target.closest('.cancel-modal-panel') ||
    target.closest('.modal-content-scroll') ||
    target.closest('.image-details-modal-box') ||
    target.closest('.lib-details-panel') ||
    target.closest('.custom-modal-scroll')
  );
  if (!insideScrollable) {
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

