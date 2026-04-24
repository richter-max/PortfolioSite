export type PostKind = 'SEC' | 'FLD' | 'NTE';

export interface Post {
  slug: string;
  kind: PostKind;
  date: string;
  title: string;
  excerpt: string;
  href: string;
}

export const kindColor: Record<PostKind, string> = {
  SEC: '#2E6BFF',
  FLD: '#E8A23C',
  NTE: '#A8A6A0',
};

export const kindLabel: Record<PostKind, string> = {
  SEC: 'SECURITY',
  FLD: 'FIELD',
  NTE: 'NOTE',
};

export const posts: Post[] = [
  {
    slug: 'rag-injection',
    kind: 'SEC',
    date: '2026 · 10',
    title: 'Prompt Injection in RAG',
    excerpt: 'Why retrieval-augmented pipelines leak intent before they leak data.',
    href: '/blog/rag-injection',
  },
  {
    slug: 'athletes-engineers',
    kind: 'NTE',
    date: '2026 · 09',
    title: 'Athletes as Engineers',
    excerpt: 'Taper weeks taught me more about shipping than any sprint did.',
    href: '/blog/athletes-engineers',
  },
  {
    slug: 'berlin-report',
    kind: 'FLD',
    date: '2026 · 09',
    title: 'Berlin Race Report',
    excerpt: 'Three hours, flat. No pacer. No music. One pact with myself.',
    href: '/blog/berlin-report',
  },
  {
    slug: 'agent-threat-model',
    kind: 'SEC',
    date: '2026 · 08',
    title: 'Threat Modeling AI Agents',
    excerpt: 'A framework for evaluating agentic systems before they ship.',
    href: '/blog/agent-threat-model',
  },
  {
    slug: 'zone-two',
    kind: 'FLD',
    date: '2026 · 07',
    title: 'The Zone Two Question',
    excerpt: 'Cheap watts, expensive patience — why aerobic base still wins.',
    href: '/blog/zone-two',
  },
  {
    slug: 'vendor-questionnaires',
    kind: 'NTE',
    date: '2026 · 06',
    title: 'On Vendor Questionnaires',
    excerpt: 'What VendorQ taught me about how security actually gets sold.',
    href: '/blog/vendor-questionnaires',
  },
];
