// weeks.js — the 52 week squares on On Track. Hover previews a week,
// click or tap picks it, arrow keys move through the weeks (one tab stop
// for the whole grid). The detail line below shows what was trained.

for (const grid of document.querySelectorAll('[data-weeks]')) {
  const squares = [...grid.querySelectorAll('button')];
  const out = grid.parentElement.querySelector('[data-week-out]');
  const when = out.querySelector('[data-week-when]');
  const sum = out.querySelector('[data-week-sum]');
  const sports = out.querySelector('[data-week-sports]');
  let picked = squares.findIndex((b) => b.getAttribute('aria-pressed') === 'true');

  const show = (i) => {
    const b = squares[i];
    when.textContent = b.dataset.when;
    sum.textContent = b.dataset.sum;
    sports.textContent = b.dataset.sports;
  };
  const pick = (i, focus) => {
    squares.forEach((b, n) => {
      b.setAttribute('aria-pressed', String(n === i));
      b.tabIndex = n === i ? 0 : -1;
    });
    picked = i;
    show(i);
    if (focus) squares[i].focus();
  };

  squares.forEach((b, i) => {
    b.addEventListener('click', () => pick(i, false));
    b.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') show(i);
    });
  });
  grid.addEventListener('pointerleave', () => show(picked));

  // 13 columns: left/right = one week, up/down = one row (13 weeks).
  grid.addEventListener('keydown', (e) => {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -13, ArrowDown: 13, Home: -999, End: 999 }[e.key];
    if (step === undefined) return;
    e.preventDefault();
    pick(Math.max(0, Math.min(squares.length - 1, picked + step)), true);
  });
}
