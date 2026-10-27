// aegis.js — the AEGIS run. 6 attacks that name themselves, 14 evasive
// attacks and 10 harmless requests travel from the agent to its tools
// through the selected guards. Blocked requests stop at the guard and
// fade with a cross. The numbers match the published results; the
// readable version is the table and sentence next to the canvas.

import { animate, fit, reduceMotion, rng } from './motion.js';

const INK = '#edebe6';
const MUTED = '#8f8b84';
const CYCLE = 10.5;

for (const root of document.querySelectorAll('[data-aegis]')) {
  const canvas = root.querySelector('canvas');
  const buttons = [...root.querySelectorAll('[data-setup]')];
  const out = {
    through: root.querySelector('[data-out-through]'),
    blocked: root.querySelector('[data-out-blocked]'),
    verdict: root.querySelector('[data-out-verdict]'),
  };

  const rand = rng(20261026);
  const cases = [
    ...Array.from({ length: 6 }, () => ({ band: 0, atk: true, named: true })),
    ...Array.from({ length: 14 }, () => ({ band: 1, atk: true, named: false })),
    ...Array.from({ length: 10 }, (_, i) => ({ band: 2, atk: false, fp: i < 2 })),
  ].map((c) => ({ ...c, lane: 0.15 + rand() * 0.7, delay: rand() * 6.5, speed: 0.09 + rand() * 0.035 }));

  let ctx, W, H;
  let setup = buttons.find((b) => b.getAttribute('aria-pressed') === 'true')?.dataset.setup ?? 'layered';
  let offset = 0; // restart the run when the setup changes
  const still = reduceMotion();

  buttons.forEach((b) =>
    b.addEventListener('click', () => {
      setup = b.dataset.setup;
      buttons.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      out.through.textContent = b.dataset.through;
      out.blocked.textContent = b.dataset.blocked;
      out.verdict.textContent = b.dataset.verdict;
      canvas.setAttribute('aria-label', `AEGIS run with ${b.textContent.trim()} guards: ${b.dataset.through} attacks get through, ${b.dataset.blocked} harmless requests are blocked.`);
      offset = performance.now() / 1000;
      if (still) draw();
    }),
  );

  const draw = () => {
    // With reduced motion: one still frame, mid-run, so every outcome shows.
    const time = still ? 7.5 : (performance.now() / 1000 - offset) % CYCLE;
    const hasK = setup === 'keyword' || setup === 'layered';
    const hasS = setup === 'semantic' || setup === 'layered';
    const narrow = W < 640;
    const left = Math.min(190, W * 0.28);
    const KX = left + (W - left) * 0.38;
    const SX = left + (W - left) * 0.64;
    const top = 40;
    const bands = [
      [top, H * 0.38, narrow ? 'Obvious' : 'Attacks that name themselves', '6 cases'],
      [H * 0.38, H * 0.72, narrow ? 'Evasive' : 'Evasive attacks', '14 cases'],
      [H * 0.72, H - 8, narrow ? 'Harmless' : 'Harmless requests', '10 controls'],
    ];

    ctx.clearRect(0, 0, W, H);
    ctx.textBaseline = 'top';
    ctx.font = '500 11px "IBM Plex Mono", monospace';
    bands.forEach(([y0, , label, n], i) => {
      if (i) {
        ctx.strokeStyle = 'rgba(237,235,230,.14)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, y0);
        ctx.lineTo(W, y0);
        ctx.stroke();
      }
      ctx.fillStyle = INK;
      ctx.fillText(label.toUpperCase(), 14, y0 + 10);
      ctx.fillStyle = MUTED;
      ctx.fillText(n.toUpperCase(), 14, y0 + 26);
    });
    [
      [KX, 'KEYWORD', hasK],
      [SX, 'SEMANTIC', hasS],
    ].forEach(([x, label, on]) => {
      ctx.globalAlpha = on ? 1 : 0.18;
      ctx.strokeStyle = INK;
      ctx.lineWidth = on ? 2 : 1;
      ctx.setLineDash(on ? [] : [3, 6]);
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, H - 8);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = INK;
      ctx.fillText(label + (on ? ' GUARD' : ' · OFF'), x + 8, 14);
      ctx.globalAlpha = 1;
    });

    for (const c of cases) {
      const [y0, y1] = bands[c.band];
      const y = y0 + 44 + c.lane * (y1 - y0 - 52);
      const run = time - c.delay;
      if (run < 0) continue;
      let x = left + run * c.speed * (W - left);
      let stopAt = null;
      if (c.atk && c.named) stopAt = hasK ? KX : hasS ? SX : null;
      if (!c.atk && c.fp && hasK) stopAt = KX;
      let since = 0;
      let blocked = false;
      if (stopAt !== null && x >= stopAt - 7) {
        since = (x - (stopAt - 7)) / (c.speed * (W - left));
        x = stopAt - 7;
        blocked = true;
      }
      if (x > W + 12) continue;
      const alpha = blocked ? Math.max(0, 1 - Math.max(0, since - 0.6) / 2.4) : 1;
      if (alpha <= 0) continue;

      ctx.globalAlpha = alpha * 0.22;
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(Math.max(left, x - 80), y);
      ctx.lineTo(x, y);
      ctx.stroke();
      ctx.globalAlpha = alpha;
      if (c.atk) {
        ctx.fillStyle = INK;
        ctx.beginPath();
        ctx.arc(x, y, 3.8, 0, 6.283);
        ctx.fill();
      } else {
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 6.283);
        ctx.stroke();
      }
      if (blocked) {
        const k = Math.min(1, since * 3);
        const cx = stopAt + 12;
        ctx.strokeStyle = INK;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(cx - 5 * k, y - 5 * k);
        ctx.lineTo(cx + 5 * k, y + 5 * k);
        ctx.moveTo(cx + 5 * k, y - 5 * k);
        ctx.lineTo(cx - 5 * k, y + 5 * k);
        ctx.stroke();
        if (!c.atk) {
          ctx.font = '500 10px "IBM Plex Mono", monospace';
          ctx.fillStyle = INK;
          ctx.fillText('FALSE POSITIVE', cx + 12, y - 5);
          ctx.font = '500 11px "IBM Plex Mono", monospace';
        }
      }
      ctx.globalAlpha = 1;
    }
  };

  animate(canvas, { draw, onResize: () => ({ ctx, W, H } = fit(canvas)), stillAt: 7.5 });
}
