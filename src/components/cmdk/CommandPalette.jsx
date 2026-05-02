// CommandPalette.jsx — Cmd+K / Ctrl+K palette.
//
// Linear / Vercel-style overlay: fuzzy search across pages, actions
// and live data, with keyboard navigation. Built without an npm
// dependency — about 250 LOC for the whole thing including styles.
//
// Loaded as a React island via `client:idle` so it doesn't compete
// with hero rendering. Listens on document for the Cmd+K / Ctrl+K
// shortcut + a public `window.__openCmdk()` for any in-page trigger.

import { useEffect, useMemo, useRef, useState } from 'react';

const STORAGE_KEY = 'mr_cmdk_recent_v1';
const MAX_RECENT = 5;

// ── Item catalogue ─────────────────────────────────────────────────
// Each item: id, label, hint (optional), section, kind, plus either
// `href` (navigate) or `action` (run a function). The list is small
// enough to scan; once it grows past ~30 we'd partition by section
// imports.
function buildItems(live) {
  const items = [];

  // ── GO TO ──────────────────────────────────────────────────────────
  const pages = [
    { id: 'home',       label: 'Home',       hint: '/',                                href: '/' },
    { id: 'work',       label: 'Work',       hint: '/#work',                           href: '/#work' },
    { id: 'field',      label: 'Field',      hint: '/#field',                          href: '/#field' },
    { id: 'stats',      label: 'Stats',      hint: '/#numbers',                        href: '/#numbers' },
    { id: 'blog',       label: 'Blog',       hint: '/#blog',                           href: '/#blog' },
    { id: 'contact',    label: 'Contact',    hint: '/#contact',                        href: '/#contact' },
    { id: 'aegis',      label: 'AEGIS',      hint: 'Case study · Security harness',    href: '/case-studies/aegis' },
    { id: 'scanner',    label: 'Scanner',    hint: 'Case study · Attack surface',      href: '/case-studies/scanner' },
    { id: 'vendorq',    label: 'VendorQ',    hint: 'Case study · B2B SaaS',            href: '/case-studies/vendorq' },
    { id: 'smb',        label: 'SMB',        hint: 'Case study · Security product',    href: '/case-studies/smb' },
    { id: 'security',   label: 'Threats',    hint: 'Threat model · self-audit',        href: '/security' },
    { id: 'greenloop',  label: 'The trade',  hint: 'Blog · Field · Backyard ultra',    href: '/blog/crewing-greenloop' },
    { id: 'ausbildung', label: 'Ausbildung first',     hint: 'Blog · Note · Career',    href: '/blog/ausbildung-first' },
    { id: 'aegis-blog', label: 'Six lessons from AEGIS', hint: 'Blog · Security',       href: '/blog/building-aegis' },
    { id: 'privacy',    label: 'Public, by accident',  hint: 'Blog · Security · OSINT', href: '/blog/public-by-accident' },
    { id: 'notion',     label: "Why I didn't use Notion", hint: 'Blog · Engineering',   href: '/blog/why-not-notion' },
    { id: 'tt-season',  label: 'Eighty-seven points',  hint: 'Blog · Field · TT',       href: '/blog/tt-season-2025-26' },
    { id: 'shenzhen',   label: 'Two weeks in Shenzhen', hint: 'Blog · Note',            href: '/blog/two-weeks-in-shenzhen' },
    { id: 'rss',        label: 'RSS feed',   hint: '/rss.xml',                         href: '/rss.xml' },
    { id: 'impressum',  label: 'Impressum',  hint: '§5 TMG',                           href: '/impressum' },
    { id: 'datenschutz',label: 'Datenschutz',hint: 'DSGVO',                            href: '/datenschutz' },
  ];
  for (const p of pages) items.push({ ...p, section: 'GO TO', kind: 'page' });

  // ── ACTIONS ────────────────────────────────────────────────────────
  items.push({
    id: 'copy-email',
    label: 'Copy email address',
    hint: 'max.richter.dev@proton.me',
    section: 'ACTIONS',
    kind: 'action',
    action: () => copyToClipboard('max.richter.dev@proton.me', 'Email copied'),
  });
  items.push({
    id: 'copy-pgp',
    label: 'Copy PGP fingerprint',
    hint: '2A11 41D8 7D21 6D3B …',
    section: 'ACTIONS',
    kind: 'action',
    action: () => copyToClipboard('2A11 41D8 7D21 6D3B 2DF6 22AB 00D4 248C 65D3 E5AF', 'Fingerprint copied'),
  });
  items.push({
    id: 'download-pgp',
    label: 'Download PGP public key',
    hint: '/pgp/maxrichter.asc',
    section: 'ACTIONS',
    kind: 'action',
    action: () => { window.location.href = '/pgp/maxrichter.asc'; },
  });
  items.push({
    id: 'view-source',
    label: 'View source on GitHub',
    hint: 'github.com/richter-max/PortfolioSite',
    section: 'ACTIONS',
    kind: 'action',
    action: () => window.open('https://github.com/richter-max/PortfolioSite', '_blank', 'noopener'),
  });

  // ── LIVE (read-only display) ──────────────────────────────────────
  if (live?.strava) {
    items.push({
      id: 'live-streak',
      label: `Strava streak — ${live.strava.streakWeeks} weeks`,
      hint: 'Consecutive weeks logged',
      section: 'LIVE',
      kind: 'info',
      action: () => window.open('https://strava.app.link/mIlXsvnJL1b', '_blank', 'noopener'),
    });
    if (live.strava.lastRun) {
      items.push({
        id: 'live-lastrun',
        label: `Last run — ${live.strava.lastRun.weekday}, ${live.strava.lastRun.km} km`,
        hint: live.strava.lastRun.isoDate,
        section: 'LIVE',
        kind: 'info',
        action: () => window.open('https://strava.app.link/mIlXsvnJL1b', '_blank', 'noopener'),
      });
    }
    items.push({
      id: 'live-sessions',
      label: `Sessions / ${new Date().getFullYear()} — ${live.strava.sessionsThisYear}`,
      hint: 'Every swim, bike, run, lift',
      section: 'LIVE',
      kind: 'info',
    });
  }
  if (live?.github) {
    items.push({
      id: 'live-commits',
      label: `Commits / 30 days — ${live.github.commits30d}`,
      hint: 'Public + private',
      section: 'LIVE',
      kind: 'info',
      action: () => window.open('https://github.com/richter-max', '_blank', 'noopener'),
    });
    if (live.github.latestRepo) {
      items.push({
        id: 'live-repo',
        label: `Currently shipping — ${live.github.latestRepo.name}`,
        hint: live.github.latestRepo.headline ?? 'View repo',
        section: 'LIVE',
        kind: 'info',
        action: () => window.open(live.github.latestRepo.url, '_blank', 'noopener'),
      });
    }
  }

  // ── SOCIAL ─────────────────────────────────────────────────────────
  items.push({ id: 'soc-github',  label: 'GitHub',   hint: '@richter-max',  section: 'SOCIAL', kind: 'link', action: () => window.open('https://github.com/richter-max', '_blank', 'noopener') });
  items.push({ id: 'soc-li',      label: 'LinkedIn', hint: 'in/maximilian-richter-…', section: 'SOCIAL', kind: 'link', action: () => window.open('https://www.linkedin.com/in/maximilian-richter-40697a298', '_blank', 'noopener') });
  items.push({ id: 'soc-strava',  label: 'Strava',   hint: 'mIlXsvnJL1b',   section: 'SOCIAL', kind: 'link', action: () => window.open('https://strava.app.link/mIlXsvnJL1b', '_blank', 'noopener') });

  return items;
}

// ── Helpers ────────────────────────────────────────────────────────
function copyToClipboard(text, _toast) {
  try { navigator.clipboard.writeText(text); } catch {}
}

// Subsequence fuzzy match. Returns null if no match, otherwise an
// array of matched character indices for highlighting + a score.
function fuzzyMatch(query, target) {
  if (!query) return { score: 0, indices: [] };
  const q = query.toLowerCase();
  const t = target.toLowerCase();
  const indices = [];
  let qi = 0;
  let consecutive = 0;
  let score = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] === q[qi]) {
      indices.push(i);
      qi++;
      consecutive++;
      score += 1 + consecutive;       // reward consecutive matches
      if (i === 0) score += 5;        // start-of-string boost
      if (i > 0 && t[i - 1] === ' ') score += 3; // word-start boost
    } else {
      consecutive = 0;
    }
  }
  if (qi !== q.length) return null;
  // Slight penalty per unmatched character so shorter targets win on ties.
  score -= (t.length - indices.length) * 0.05;
  return { score, indices };
}

function highlight(text, indices) {
  if (!indices?.length) return text;
  const out = [];
  let last = 0;
  for (const i of indices) {
    if (i > last) out.push(<span key={`p${last}`}>{text.slice(last, i)}</span>);
    out.push(<mark key={`m${i}`}>{text[i]}</mark>);
    last = i + 1;
  }
  if (last < text.length) out.push(<span key={`p${last}-end`}>{text.slice(last)}</span>);
  return out;
}

// ── Component ──────────────────────────────────────────────────────
export default function CommandPalette({ live = {} }) {
  const [open, setOpen]       = useState(false);
  const [query, setQuery]     = useState('');
  const [active, setActive]   = useState(0);
  const [recent, setRecent]   = useState([]);
  const inputRef = useRef(null);
  const listRef  = useRef(null);

  const items = useMemo(() => buildItems(live), [live]);

  // Load recent IDs from localStorage on first mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  // Public API: window.__openCmdk() for any in-page button to trigger.
  // Keyboard shortcut: Cmd/Ctrl + K. Esc closes when open.
  useEffect(() => {
    function onKey(e) {
      const isCmdK =
        (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k';
      if (isCmdK) {
        e.preventDefault();
        setOpen((v) => !v);
        return;
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    }
    document.addEventListener('keydown', onKey);
    window.__openCmdk = () => setOpen(true);
    return () => {
      document.removeEventListener('keydown', onKey);
      delete window.__openCmdk;
    };
  }, [open]);

  // Focus input + reset state on open.
  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // wait one tick so the input exists in the DOM
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Build filtered + sorted result list.
  const results = useMemo(() => {
    if (!query.trim()) {
      // Empty query: show recent first, then a curated default order
      // (GO TO → ACTIONS → LIVE → SOCIAL).
      const recentItems = recent
        .map((id) => items.find((it) => it.id === id))
        .filter(Boolean);
      const recentSet = new Set(recentItems.map((it) => it.id));
      const rest = items.filter((it) => !recentSet.has(it.id));
      return [...recentItems, ...rest].map((it) => ({ ...it, indices: [] }));
    }
    const scored = [];
    for (const it of items) {
      const m = fuzzyMatch(query, it.label) ?? fuzzyMatch(query, it.hint || '');
      if (m) scored.push({ ...it, score: m.score, indices: m.indices });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, 14);
  }, [query, items, recent]);

  // Keep active index in range when results change.
  useEffect(() => {
    if (active >= results.length) setActive(0);
  }, [results, active]);

  // Group results by section while preserving sort order.
  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of results) {
      if (!map.has(it.section)) map.set(it.section, []);
      map.get(it.section).push(it);
    }
    // Flatten back so active-index math stays linear, but emit the
    // section heading whenever the section changes.
    const flat = [];
    for (const [section, group] of map.entries()) {
      flat.push({ kind: 'header', section });
      for (const it of group) flat.push(it);
    }
    return flat;
  }, [results]);

  // The "active index" is in `results` (no headers). We need the DOM
  // index in `grouped` for scrollIntoView.
  const activeDomId = results[active]?.id;

  useEffect(() => {
    if (!open || !activeDomId) return;
    const el = listRef.current?.querySelector(`[data-id="${activeDomId}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [open, activeDomId]);

  function pushRecent(id) {
    const next = [id, ...recent.filter((x) => x !== id)].slice(0, MAX_RECENT);
    setRecent(next);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
  }

  function activate(item) {
    pushRecent(item.id);
    setOpen(false);
    setQuery('');
    if (item.href) {
      // Internal nav: let Astro view-transitions handle it; fragment
      // links work too because they're same-document.
      window.location.assign(item.href);
    } else if (item.action) {
      try { item.action(); } catch (e) { console.warn('cmdk action failed', e); }
    }
  }

  function onKeyDown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const it = results[active];
      if (it) activate(it);
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="cmdk-root"
      onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
    >
      <div className="cmdk-panel">
        <div className="cmdk-input-row">
          <span className="cmdk-input-icon" aria-hidden="true">⌘</span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => { setQuery(e.target.value); setActive(0); }}
            onKeyDown={onKeyDown}
            placeholder="Search pages, actions, anything…"
            aria-label="Command palette input"
            autoComplete="off"
            spellCheck={false}
          />
          <span className="cmdk-input-hint" aria-hidden="true">ESC</span>
        </div>

        <div className="cmdk-list" ref={listRef} role="listbox">
          {grouped.length === 0 && (
            <div className="cmdk-empty">No results for "{query}"</div>
          )}
          {grouped.map((row, gi) => {
            if (row.kind === 'header') {
              return (
                <div className="cmdk-section" key={`h-${row.section}-${gi}`} aria-hidden="true">
                  {!query && row.section === results[0]?.section && recent.length
                    ? 'RECENT · ' + row.section
                    : row.section}
                </div>
              );
            }
            const isActive = row.id === activeDomId;
            return (
              <div
                key={row.id}
                data-id={row.id}
                role="option"
                aria-selected={isActive}
                className={'cmdk-item' + (isActive ? ' is-active' : '')}
                onMouseEnter={() => {
                  const idx = results.findIndex((r) => r.id === row.id);
                  if (idx >= 0) setActive(idx);
                }}
                onClick={() => activate(row)}
              >
                <span className="cmdk-item-label">
                  {highlight(row.label, row.indices)}
                </span>
                {row.hint && (
                  <span className="cmdk-item-hint">{row.hint}</span>
                )}
                <span className="cmdk-item-kind" aria-hidden="true">
                  {row.kind === 'page'   && '↗'}
                  {row.kind === 'action' && '↪'}
                  {row.kind === 'link'   && '↗'}
                  {row.kind === 'info'   && '●'}
                </span>
              </div>
            );
          })}
        </div>

        <div className="cmdk-footer">
          <span><kbd>↑</kbd><kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span><kbd>esc</kbd> close</span>
          <span className="cmdk-footer-spacer" />
          <span className="cmdk-footer-brand">richtermax.com</span>
        </div>
      </div>

      <style>{`
        .cmdk-root {
          position: fixed;
          inset: 0;
          z-index: 9998;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding: 14vh 16px 16px;
          background: rgba(5, 5, 6, 0.62);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          animation: cmdk-fade 140ms ease-out;
        }
        @keyframes cmdk-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .cmdk-panel {
          width: 100%;
          max-width: 620px;
          background: #0d0d0e;
          border: 1px solid rgba(243, 241, 236, 0.12);
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 24px 64px rgba(0, 0, 0, 0.5),
            0 4px 16px rgba(0, 0, 0, 0.35),
            inset 0 1px 0 rgba(243, 241, 236, 0.04);
          animation: cmdk-rise 200ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        @keyframes cmdk-rise {
          from { opacity: 0; transform: translateY(8px) scale(0.985); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .cmdk-input-row {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px 20px;
          border-bottom: 1px solid rgba(243, 241, 236, 0.06);
        }
        .cmdk-input-icon {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 14px;
          color: #6B6965;
          line-height: 1;
        }
        .cmdk-input-row input {
          flex: 1;
          background: transparent;
          border: 0;
          outline: 0;
          padding: 0;
          color: #F3F1EC;
          font-family: 'Inter Tight', sans-serif;
          font-size: 17px;
          letter-spacing: -0.01em;
        }
        .cmdk-input-row input::placeholder {
          color: #6B6965;
        }
        .cmdk-input-hint {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 9px;
          letter-spacing: 0.18em;
          color: #6B6965;
          padding: 3px 8px;
          border: 1px solid rgba(243, 241, 236, 0.12);
          border-radius: 4px;
        }

        .cmdk-list {
          max-height: 56vh;
          overflow-y: auto;
          padding: 8px 0 12px;
        }
        .cmdk-empty {
          padding: 32px 20px;
          color: #6B6965;
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-align: center;
        }
        .cmdk-section {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 9px;
          letter-spacing: 0.22em;
          color: #6B6965;
          padding: 14px 20px 6px;
          text-transform: uppercase;
        }

        .cmdk-item {
          display: grid;
          grid-template-columns: 1fr auto auto;
          align-items: center;
          gap: 16px;
          padding: 10px 20px;
          margin: 0 8px;
          border-radius: 6px;
          color: #A8A6A0;
          font-family: 'Inter Tight', sans-serif;
          font-size: 15px;
          letter-spacing: -0.005em;
          cursor: pointer;
          transition: background 0.12s ease, color 0.12s ease;
        }
        .cmdk-item.is-active {
          background: rgba(46, 107, 255, 0.10);
          color: #F3F1EC;
        }
        .cmdk-item-label {
          color: inherit;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cmdk-item-label mark {
          background: transparent;
          color: #2E6BFF;
          font-weight: 500;
        }
        .cmdk-item.is-active .cmdk-item-label { color: #F3F1EC; }
        .cmdk-item-hint {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 0.06em;
          color: #6B6965;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          max-width: 220px;
        }
        .cmdk-item-kind {
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 12px;
          color: #6B6965;
          width: 14px;
          text-align: right;
        }
        .cmdk-item.is-active .cmdk-item-kind { color: #2E6BFF; }

        .cmdk-footer {
          display: flex;
          align-items: center;
          gap: 18px;
          padding: 10px 20px;
          border-top: 1px solid rgba(243, 241, 236, 0.06);
          font-family: 'JetBrains Mono', ui-monospace, monospace;
          font-size: 10px;
          letter-spacing: 0.16em;
          color: #6B6965;
          text-transform: uppercase;
        }
        .cmdk-footer kbd {
          display: inline-block;
          padding: 1px 6px;
          margin-right: 4px;
          border: 1px solid rgba(243, 241, 236, 0.12);
          border-radius: 3px;
          font-family: inherit;
          font-size: 9px;
          color: #A8A6A0;
        }
        .cmdk-footer-spacer { flex: 1; }
        .cmdk-footer-brand { color: #6B6965; }

        @media (prefers-reduced-motion: reduce) {
          .cmdk-root, .cmdk-panel { animation: none; }
        }

        @media (max-width: 640px) {
          .cmdk-root { padding: 6vh 12px 12px; }
          .cmdk-panel { max-width: 100%; }
          .cmdk-list { max-height: 64vh; }
          .cmdk-item-hint { display: none; }
          .cmdk-footer { font-size: 9px; gap: 12px; }
        }
      `}</style>
    </div>
  );
}
