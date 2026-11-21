/**
 * Functional filter, search, and verse deep-linking for the AXIOM Codex.
 */

/**
 * Normalizes a search input into a lowercase trimmed query.
 * @param {string} raw
 * @returns {string}
 */
export const normalizeQuery = (raw) => raw.trim().toLowerCase();

/**
 * Pure predicate checking whether a verse or its chapter matches the query.
 * @param {string} verseText
 * @param {string} chapterTitle
 * @param {string} query
 * @returns {boolean}
 */
export const matchesVerse = (verseText, chapterTitle, query) => {
  if (!query) return true;
  return (
    verseText.toLowerCase().includes(query) ||
    chapterTitle.toLowerCase().includes(query)
  );
};

/**
 * Applies part and query filters to Codex DOM sections and returns visibility counts.
 * @param {HTMLElement[]} parts
 * @param {string} query
 * @param {string} activePart
 * @returns {{ visibleChapters: number, visibleVerses: number }}
 */
export const filterCodexDOM = (parts, query, activePart) =>
  parts.reduce(
    (totals, partEl) => {
      const partKey = partEl.dataset.part || '';
      const partAllowed = activePart === 'all' || partKey === activePart;

      if (!partAllowed) {
        partEl.hidden = true;
        return totals;
      }

      const chapters = Array.from(partEl.querySelectorAll('.codex-chapter'));
      let partVisibleChapters = 0;

      chapters.forEach((chapterEl) => {
        const title = chapterEl.querySelector('.codex-chapter__title')?.textContent || '';
        const verses = Array.from(chapterEl.querySelectorAll('.verse'));
        let chapterVisibleVerses = 0;

        verses.forEach((verseEl) => {
          const text = verseEl.querySelector('.verse__text')?.textContent || '';
          const visible = matchesVerse(text, title, query);
          verseEl.hidden = !visible;
          if (visible) chapterVisibleVerses += 1;
        });

        chapterEl.hidden = chapterVisibleVerses === 0;
        if (chapterVisibleVerses > 0) {
          partVisibleChapters += 1;
          totals.visibleChapters += 1;
          totals.visibleVerses += chapterVisibleVerses;
        }
      });

      partEl.hidden = partVisibleChapters === 0;
      return totals;
    },
    { visibleChapters: 0, visibleVerses: 0 }
  );

/**
 * Initializes search, part filter pills, and click-to-copy verse links on the Codex page.
 * @param {HTMLElement | null} root
 * @returns {() => void} Cleanup callback.
 */
export const initCodexControls = (root) => {
  if (!root) return () => {};

  const searchInput = root.querySelector('#codex-search');
  const statusEl = root.querySelector('#codex-status');
  const pills = Array.from(root.querySelectorAll('.codex-pill'));
  const parts = Array.from(root.querySelectorAll('.codex-part'));

  let activePart = 'all';
  let currentQuery = '';

  const render = () => {
    const { visibleChapters, visibleVerses } = filterCodexDOM(
      parts,
      currentQuery,
      activePart
    );
    if (statusEl) {
      statusEl.textContent = `${visibleChapters} Chapters · ${visibleVerses} Verses`;
    }
  };

  const onSearch = (event) => {
    currentQuery = normalizeQuery(event.target.value);
    render();
  };

  const onPillClick = (event) => {
    const btn = event.currentTarget;
    activePart = btn.dataset.partFilter || 'all';
    pills.forEach((pill) =>
      pill.setAttribute('aria-pressed', String(pill === btn))
    );
    render();
  };

  const onVerseRefClick = (event) => {
    const btn = event.target.closest('.verse__ref');
    if (!btn) return;
    const verseEl = btn.closest('.verse');
    if (!verseEl || !verseEl.id) return;

    const url = `${window.location.origin}${window.location.pathname}#${verseEl.id}`;
    window.history.replaceState(null, '', `#${verseEl.id}`);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).catch(() => {});
    }

    const original = btn.textContent;
    btn.textContent = 'Copied';
    window.setTimeout(() => {
      btn.textContent = original;
    }, 1100);
  };

  searchInput?.addEventListener('input', onSearch);
  pills.forEach((pill) => pill.addEventListener('click', onPillClick));
  root.addEventListener('click', onVerseRefClick);

  render();

  return () => {
    searchInput?.removeEventListener('input', onSearch);
    pills.forEach((pill) => pill.removeEventListener('click', onPillClick));
    root.removeEventListener('click', onVerseRefClick);
  };
};
