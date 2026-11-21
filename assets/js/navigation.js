/**
 * Pure route & accessible navigation helpers.
 */

/**
 * Normalizes a URL pathname into a canonical page filename.
 * @param {string} pathname
 * @returns {string}
 */
export const resolveActivePath = (pathname) => {
  const clean = pathname.split('?')[0].split('#')[0];
  const segment = clean.split('/').filter(Boolean).pop();
  return segment && segment.includes('.') ? segment : 'index.html';
};

/**
 * Applies aria-current="page" to navigation links matching activePage.
 * @param {NodeListOf<HTMLAnchorElement> | HTMLAnchorElement[]} links
 * @param {string} activePage
 * @returns {number} Count of links marked active.
 */
export const applyActiveNavLinks = (links, activePage) =>
  Array.from(links).reduce((count, link) => {
    const href = link.getAttribute('href') || '';
    const isMatch = resolveActivePath(href) === activePage;
    if (isMatch) {
      link.setAttribute('aria-current', 'page');
      return count + 1;
    }
    link.removeAttribute('aria-current');
    return count;
  }, 0);

/**
 * Wires an accessible mobile navigation drawer toggle.
 * @param {HTMLButtonElement | null} toggleBtn
 * @param {HTMLElement | null} drawer
 * @returns {() => void} Cleanup callback.
 */
export const initMobileMenu = (toggleBtn, drawer) => {
  if (!toggleBtn || !drawer) return () => {};

  const setOpen = (isOpen) => {
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    drawer.hidden = !isOpen;
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  const onToggle = () => {
    const isCurrentlyOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    setOpen(!isCurrentlyOpen);
  };

  const onKeyDown = (event) => {
    if (event.key === 'Escape' && !drawer.hidden) {
      setOpen(false);
      toggleBtn.focus();
    }
  };

  const onDrawerClick = (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      setOpen(false);
    }
  };

  toggleBtn.addEventListener('click', onToggle);
  document.addEventListener('keydown', onKeyDown);
  drawer.addEventListener('click', onDrawerClick);

  return () => {
    toggleBtn.removeEventListener('click', onToggle);
    document.removeEventListener('keydown', onKeyDown);
    drawer.removeEventListener('click', onDrawerClick);
  };
};
