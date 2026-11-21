/**
 * Pure scroll-progress and editorial reveal utilities.
 */

/**
 * Computes clamped reading progress in [0, 1].
 * @param {number} scrollY
 * @param {number} docHeight
 * @param {number} viewportHeight
 * @returns {number}
 */
export const computeScrollProgress = (scrollY, docHeight, viewportHeight) => {
  const scrollable = docHeight - viewportHeight;
  if (scrollable <= 0) return 0;
  return Math.min(1, Math.max(0, scrollY / scrollable));
};

/**
 * Updates a reading progress bar element's --progress CSS custom property.
 * @param {HTMLElement | null} barEl
 * @returns {() => void} Cleanup callback.
 */
export const initReadingProgress = (barEl) => {
  if (!barEl) return () => {};

  let rafId = 0;

  const update = () => {
    rafId = 0;
    const progress = computeScrollProgress(
      window.scrollY,
      document.documentElement.scrollHeight,
      window.innerHeight
    );
    barEl.style.setProperty('--progress', progress.toFixed(4));
  };

  const onScroll = () => {
    if (!rafId) {
      rafId = window.requestAnimationFrame(update);
    }
  };

  update();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  return () => {
    if (rafId) window.cancelAnimationFrame(rafId);
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  };
};

/**
 * Reveals editorial blocks gracefully as they enter the viewport.
 * @param {NodeListOf<HTMLElement> | HTMLElement[]} elements
 * @returns {() => void} Cleanup callback.
 */
export const initRevealObserver = (elements) => {
  const list = Array.from(elements);
  if (!list.length) return () => {};

  if (!('IntersectionObserver' in window)) {
    list.forEach((el) => el.classList.add('is-visible'));
    return () => {};
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
  );

  list.forEach((el) => observer.observe(el));
  return () => observer.disconnect();
};
