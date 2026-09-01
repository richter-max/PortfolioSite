  // Recompute the next-start block from the embedded race list so the
  // static HTML can never show a stale event. Progressive enhancement:
  // without JS, the build-time values render — regenerated on each
  // daily stats deploy, so they stay at most a day old anyway.
  const el = document.getElementById('nextstart');
  if (el) {
    const MONTHS = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
    const races = JSON.parse(el.dataset.races || '[]');
    const today = new Date();
    const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const days = (iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      return Math.round((new Date(y, m - 1, d) - midnight) / 86400000);
    };
    const fmt = (iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      return `${d} ${MONTHS[m - 1]} ${y}`;
    };
    const future = races.filter((r) => days(r.date) >= 0);
    if (future.length === 0) {
      el.remove();
    } else {
      const [next, then] = future;
      el.querySelector('[data-ns-name]').textContent = next.name;
      el.querySelector('[data-ns-spec]').textContent =
        `${fmt(next.date)} · ${next.format}${next.target ? ` · TARGET ${next.target}` : ''}`;
      el.querySelector('[data-ns-days]').textContent = String(days(next.date));
      const thenEl = el.querySelector('[data-ns-then]');
      if (thenEl) {
        if (then) {
          thenEl.textContent = `THEN · ${then.name.toUpperCase()} · ${fmt(then.date)}`;
        } else {
          thenEl.remove();
        }
      }
    }
  }
