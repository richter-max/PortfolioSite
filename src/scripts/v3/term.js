// term.js — the Off Track terminal answers a few commands. Everything it
// prints is already on the page; it's another way in for people who like
// a prompt. Without JS the terminal is just the scan result.

const DAY = 864e5;

for (const term of document.querySelectorAll('.term')) {
  const form = term.querySelector('[data-term-form]');
  const dataEl = term.querySelector('[data-term-data]');
  if (!form || !dataEl) continue;
  const data = JSON.parse(dataEl.textContent);
  const out = term.querySelector('[data-term-out]');
  const body = term.querySelector('.term__body');
  const input = form.querySelector('input');
  const chips = term.querySelector('[data-term-chips]');
  const history = [];
  let hIdx = 0;

  const line = (text, cls) => {
    const div = document.createElement('div');
    div.className = cls;
    div.textContent = text;
    out.append(div);
    return div;
  };
  const link = (label, href) => {
    const div = document.createElement('div');
    div.className = 'is-res';
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    div.append(a);
    out.append(div);
  };

  const degreeNow = () => {
    const t = new Date();
    const iso = new Date(Date.UTC(t.getFullYear(), t.getMonth(), t.getDate())).toISOString().slice(0, 10);
    const b = data.blocks.find((x) => iso >= x.start && iso < x.end);
    if (!b) return iso < data.blocks[0].start ? 'Not started yet.' : 'Done. Bachelor in hand.';
    const days = Math.round((Date.parse(b.end) - Date.parse(b.start)) / DAY);
    const day = Math.floor((Date.parse(iso) - Date.parse(b.start)) / DAY) + 1;
    const n = data.blocks.indexOf(b) + 1;
    return `${b.name} · day ${day} of ${days} · block ${n} of ${data.blocks.length}`;
  };

  const COMMANDS = {
    help: () =>
      line(
        'whoami    who this is\ndegree    where the degree stands today\nprojects  what I build\naegis     the agent-security case\nroadmap   what comes next\nscan      last scan of this site\ncontact   how to reach me\ncd ~/on-track   the other side\nclear     empty the screen',
        'is-res',
      ),
    whoami: () =>
      line(
        'Max Richter. Dual student, B.Sc. Computer Science with an IT security focus, Bosch and DHBW. Heading for AI security.\nOff the keyboard: training for a 75 km night race.',
        'is-res',
      ),
    degree: () => {
      line(degreeNow(), 'is-res');
      link('↓ the block plan', '#degree-h');
    },
    projects: () => line(data.projects.map((p) => `${p.name.padEnd(24)} ${p.text}`).join('\n'), 'is-res'),
    aegis: () => {
      line(
        data.aegis.map((a) => `${a.label.padEnd(10)} attacks through ${a.through} · harmless blocked ${a.blocked}`).join('\n') +
          '\nLayering made it strictly worse.',
        'is-res',
      );
      link('↓ run it yourself', '#aegis');
    },
    roadmap: () => {
      line(data.roadmap.map((r) => `${r.state.padEnd(12)} ${r.what}`).join('\n'), 'is-res');
      link('↓ the roadmap', '#roadmap');
    },
    scan: () =>
      line(`${data.scan.target} · last run ${data.scan.date} · ${data.scan.total} findings. Next run: Monday.`, 'is-res'),
    contact: () => {
      link(data.email, `mailto:${data.email}`);
      link(data.github.replace('https://', ''), data.github);
    },
    clear: () => {
      out.textContent = '';
      body.classList.remove('has-out');
    },
  };
  const ALIAS = { ls: 'projects', 'cat roadmap': 'roadmap', 'cat roadmap.md': 'roadmap', 'ls projects': 'projects', email: 'contact', '?': 'help', man: 'help' };

  const run = (raw) => {
    const cmd = raw.trim().toLowerCase().replace(/\s+/g, ' ');
    if (!cmd) return;
    history.push(raw.trim());
    hIdx = history.length;
    if (cmd !== 'clear') line(`$ ${raw.trim()}`, 'is-in');
    const key = ALIAS[cmd] ?? cmd;
    if (COMMANDS[key]) COMMANDS[key]();
    else if (/^cd (~\/)?(\.\.\/)?on[- ]?track\/?$|^cd \/$|^cd \.\.$/.test(cmd)) {
      line('switching sides…', 'is-res');
      setTimeout(() => (window.location.href = '/'), 350);
    } else if (cmd.startsWith('sudo')) line("Nice try. This incident would be reported, but there's no tracking here.", 'is-res');
    else if (/^(rm|nmap|hack|exploit)\b/.test(cmd)) line('Passive only. Scope matters, also here.', 'is-res');
    else line(`command not found: ${raw.trim().split(' ')[0]}. Try help.`, 'is-res');
    if (out.childElementCount) body.classList.add('has-out');
    body.scrollTop = body.scrollHeight;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    run(input.value);
    input.value = '';
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' && hIdx > 0) input.value = history[--hIdx];
    else if (e.key === 'ArrowDown') input.value = hIdx < history.length - 1 ? history[++hIdx] : ((hIdx = history.length), '');
    else return;
    e.preventDefault();
  });
  chips.addEventListener('click', (e) => {
    const b = e.target.closest('[data-cmd]');
    if (b) run(b.dataset.cmd);
  });
  // Clicking anywhere in the body puts the cursor in the prompt.
  body.addEventListener('click', (e) => {
    if (!e.target.closest('a') && window.getSelection()?.isCollapsed) input.focus({ preventScroll: true });
  });

  form.hidden = false;
  chips.hidden = false;
  term.classList.add('is-live');
}
