import { resolveActivePath, applyActiveNavLinks, initMobileMenu } from './navigation.js';
import { initReadingProgress, initRevealObserver } from './reading.js';
import { initCodexControls } from './codex.js';

/**
 * Bootstraps all page-level editorial behaviors cleanly.
 * @returns {void}
 */
export const bootstrap = () => {
  const activePage = resolveActivePath(window.location.pathname);
  applyActiveNavLinks(
    document.querySelectorAll('.site-nav__link, .mobile-drawer__link'),
    activePage
  );

  initMobileMenu(
    document.querySelector('#menu-toggle'),
    document.querySelector('#mobile-drawer')
  );

  initReadingProgress(document.querySelector('.reading-progress'));
  initRevealObserver(document.querySelectorAll('.reveal'));
  initCodexControls(document.querySelector('#codex-app'));
};

document.addEventListener('DOMContentLoaded', bootstrap);
