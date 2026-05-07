/* projects.ts — Work section entries
 *
 * Each project optionally carries a `visual` payload that drives a small
 * project-specific visualization in the card. If `visual` is omitted, the
 * card falls back to the legacy `image` background. This keeps the schema
 * additive — old projects keep working, new ones get richer treatment.
 */

// ── Visual payload types ─────────────────────────────────────────────────

/** AEGIS — three-stage defense layer with attack-success drop per stage. */
export interface MatrixVisual {
  kind: 'matrix';
  /** Headline numbers, in order. First is the no-defense baseline. */
  stages: Array<{
    label: string;        // POLICY · KEYWORD · SEMANTIC
    sublabel: string;     // ALLOWLIST · REGEX · N-GRAM
    successPct: number;   // remaining attack success after this layer
  }>;
  /** Baseline before any defense. Shown as a faded marker. */
  baselinePct: number;
}

/** Scanner — typed terminal output. */
export interface TerminalVisual {
  kind: 'terminal';
  command: string;        // shown next to a $ prompt
  /** Lines printed in sequence. Empty string = blank line. */
  lines: string[];
  finalLine: string;      // emphasized result line, e.g. "28.4s · 47 findings"
}

/** VendorQ — before/after diff between question and generated answer. */
export interface DiffVisual {
  kind: 'diff';
  question: string;       // the questionnaire prompt
  answerLines: string[];  // generated answer, one block per line
  source: string;         // e.g. "SOC2-2024.pdf · §3.2"
  before: string;         // "2 weeks"
  after: string;          // "2 hours"
}

/** SMB Tool — milestone roadmap. */
export interface ProgressVisual {
  kind: 'progress';
  milestones: Array<{
    label: string;
    status: 'done' | 'active' | 'todo';
  }>;
}

export type Visual = MatrixVisual | TerminalVisual | DiffVisual | ProgressVisual;

// ── Project interface ────────────────────────────────────────────────────

export interface Project {
  index: string;
  client: string;
  role: string;
  year: string;
  summary: string;
  /** Empty string = no detail page yet; the card renders un-clickable. */
  href: string;
  /** Legacy fallback image. Used when `visual` is undefined. */
  image: string;
  tag: string;
  /** Optional per-project visualization. Falls back to `image` if absent. */
  visual?: Visual;
}

// ── Data ────────────────────────────────────────────────────────────────

export const projects: Project[] = [
  {
    index: '01.01',
    client: 'AEGIS',
    role: 'Security Framework · AI Agents',
    year: '2025',
    summary:
      'Private project. A framework for evaluating how vulnerable AI agents are to prompt injection, data exfiltration, and unauthorized actions. Built from scratch. Tested across agent architectures; surfaced vulnerability classes before deployment.',
    href: '/case-studies/aegis',
    image: '/img/opt/blog-career-1280.avif',
    tag: 'Security Research',
    visual: {
      kind: 'matrix',
      baselinePct: 82,
      stages: [
        { label: 'POLICY',   sublabel: 'ALLOWLIST', successPct: 41 },
        { label: 'KEYWORD',  sublabel: 'REGEX',     successPct: 23 },
        { label: 'SEMANTIC', sublabel: 'N-GRAM',    successPct: 9  },
      ],
    },
  },
  {
    index: '01.02',
    client: 'Attack Surface Scanner',
    role: 'CLI Tool · Open Source',
    year: '2025',
    summary:
      'Automated reconnaissance — DNS, open ports, subdomains, security headers — in one command. Full scan under thirty seconds. Live demo on the site.',
    href: '/case-studies/scanner',
    image: '/img/opt/blog-extreme-1280.avif',
    tag: 'Open Source',
    visual: {
      kind: 'terminal',
      command: 'scan -t example.com',
      lines: [
        '→ resolving DNS               A, AAAA, MX, TXT',
        '→ scanning ports              22, 80, 443, 8080',
        '→ enumerating subdomains      api, www, mail, dev',
        '→ checking security headers   HSTS, CSP, X-Frame',
      ],
      finalLine: '✓ 47 findings · 28.4s',
    },
  },
  {
    index: '01.03',
    client: 'VendorQ',
    role: 'B2B SaaS · Closed beta',
    year: '2025',
    summary:
      'AI reads existing security docs and auto-generates answers for vendor questionnaires. Two-week process compressed to a two-hour review. ~70% faster turnaround.',
    href: '',
    image: '/img/opt/blog-shenzhen-1280.avif',
    tag: 'Private · Beta',
    visual: {
      kind: 'diff',
      question: 'Do you encrypt customer data at rest using industry-standard algorithms?',
      answerLines: [
        'Yes. AES-256 encryption applied to all',
        'customer data stored in primary and',
        'backup systems. Keys rotated every 90d.',
      ],
      source: 'SOC2-2024.pdf · §3.2',
      before: '2 weeks',
      after: '2 hours',
    },
  },
  {
    index: '01.04',
    client: 'SMB Security Tool',
    role: 'Security Product · In Development',
    year: '2026',
    summary:
      'Enterprise-grade security for companies with 10–200 employees. One-click setup, automated scanning, reports a non-technical CEO can understand.',
    href: '',
    image: '/img/opt/blog-endurance-640.avif',
    tag: 'In Development',
    visual: {
      kind: 'progress',
      milestones: [
        { label: 'scanner core',   status: 'done'   },
        { label: 'report engine',  status: 'done'   },
        { label: 'onboarding',     status: 'active' },
        { label: 'pricing model',  status: 'todo'   },
      ],
    },
  },
];
