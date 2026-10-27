// offtrack.ts — content of the Off Track page. Update the status of
// fields and roadmap with the monthly update; a stale "planned" is worse
// than none.

export const fields = [
  { status: 'focus', name: 'AI agent security', text: 'Prompt injection, tool misuse, and how you measure whether a defense works. Where I want to end up.', proof: 'AEGIS', href: '#aegis' },
  { status: 'focus', name: 'Detection engineering', text: 'Which event, in which log, would have told you that something went wrong.', proof: 'Cloud Signal Engine', href: '#projects' },
  { status: 'focus', name: 'Attack surface', text: 'What a system exposes to the internet, found passively and without touching anything out of scope.', proof: 'Attack Surface Scanner', href: '#projects' },
  { status: 'groundwork', name: 'Networks & cloud', text: 'What traffic a system sends, and where identities and credentials live. The layer the rest sits on.', proof: 'No project yet' },
  { status: 'next', name: 'Offensive & web security', text: 'Coming with the degree. It goes on this page once there is something real to show.', proof: 'Not started' },
] as const;

export const projects = [
  {
    tag: 'Passive recon',
    name: 'Attack Surface Scanner',
    text: 'Finds what a domain exposes using Certificate Transparency, DNS and TLS, and checks every host against the scope before sending a single request. Runs as a CI gate.',
    note: 'Explicitly not: port scans, brute force, exploits.',
    href: 'https://github.com/richter-max/attack-surface-scanner',
  },
  {
    tag: 'Detection · MVP',
    name: 'Cloud Signal Engine',
    text: 'Detection rules for CloudTrail and Azure AD logs, mapped to MITRE ATT&CK, with a triage workflow.',
    note: 'Works end to end, rule coverage still small.',
  },
];

export const path = [
  { when: 'Sep 2023 – Jan 2026', title: 'Apprenticeship, software developer', text: 'At Bosch in Blaichach/Seifen, vocational school in Kempten. Shipping software in a team before any university theory.' },
  { when: 'Feb – Sep 2026', title: 'IT key user, digitalization', text: 'Full time at Bosch between apprenticeship and degree.' },
  { when: '2026', title: 'Own security projects', text: 'AEGIS, the scanner and the Cloud Signal Engine, built and documented in public.' },
  { when: 'Oct 2026 · now', title: 'Dual B.Sc. at DHBW and Bosch', text: 'Computer Science, IT security focus. DHBW Ravensburg, Campus Friedrichshafen. Currently in practice phase 1.', now: true },
];

/** Block plan of the dual degree: P = practice at Bosch, T = theory at DHBW. */
export const degree = {
  quarters: ['Oct – Dec', 'Jan – Mar', 'Apr – Jun', 'Jul – Sep'],
  years: [
    { label: 'Year 1', cal: '2026/27', blocks: [['P', 'Practice 1', 'Basics', true], ['T', 'Theory 1', 'Core modules'], ['T', 'Theory 2', 'Core modules'], ['P', 'Practice 2', 'Project work']] },
    { label: 'Year 2', cal: '2027/28', blocks: [['T', 'Theory 3', 'Core and profile · semester abroad possible'], ['T', 'Theory 4', 'Core and profile'], ['P', 'Practice 3', 'Project work'], ['P', 'Practice 4', 'Project work · oral exam']] },
    { label: 'Year 3', cal: '2028/29', blocks: [['T', 'Theory 5', 'Profile modules · student paper'], ['P', 'Practice 5', 'Project work'], ['T', 'Theory 6', 'Profile modules · student paper'], ['P', 'Practice 6', 'Bachelor thesis']] },
  ] as { label: string; cal: string; blocks: [string, string, string, boolean?][] }[],
};

export const roadmap = [
  { state: 'In progress', what: 'B.Sc. CS, IT security, dual', note: 'Practice phase 1 at Bosch now. First theory phase starts in January.' },
  { state: 'Planned', what: 'Hands-on labs', note: 'TryHackMe or similar. Not started yet.' },
  { state: 'Planned', what: 'First security conference', note: 'Nothing booked yet.' },
  { state: 'Long term', what: 'Work in AI security', note: 'After the degree. A long way off, and that’s fine.' },
];

/** AEGIS results, permissive policy (from the repo README). */
export const aegis = {
  repo: 'https://github.com/richter-max/aegis',
  setups: [
    { id: 'none', label: 'No guard', through: '20/20', blocked: '0/10', verdict: 'No guard. Every attack reaches the tools.' },
    { id: 'keyword', label: 'Keyword', through: '14/20', blocked: '2/10', verdict: 'Stops the 6 attacks that name themselves, misses all 14 evasive ones, and blocks 2 harmless requests.' },
    { id: 'semantic', label: 'Semantic', through: '14/20', blocked: '0/10', verdict: 'Stops the same 6, misses the same 14, and blocks nothing harmless. The best setup here.' },
    { id: 'layered', label: 'Layered', through: '14/20', blocked: '2/10', verdict: 'Both guards: still the same 6 stopped, plus the keyword guard’s false positives. Strictly worse than semantic alone.' },
  ],
};
