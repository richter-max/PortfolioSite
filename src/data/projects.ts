export interface Project {
  index: string;
  client: string;
  role: string;
  year: string;
  summary: string;
  href: string;
  image: string;
  tag: string;
}

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
  },
  {
    index: '01.02',
    client: 'Attack Surface Scanner',
    role: 'CLI Tool · Open Source',
    year: '2025',
    summary:
      'Automated reconnaissance — DNS, open ports, subdomains, security headers — in one command. Full scan under thirty seconds. Live demo on the site.',
    href: '#',
    image: '/img/opt/blog-extreme-1280.avif',
    tag: 'Open Source',
  },
  {
    index: '01.03',
    client: 'VendorQ',
    role: 'B2B SaaS · Beta',
    year: '2025',
    summary:
      'AI reads existing security docs and auto-generates answers for vendor questionnaires. Two-week process compressed to a two-hour review. ~70% faster turnaround.',
    href: '#',
    image: '/img/opt/blog-shenzhen-1280.avif',
    tag: 'SaaS · Beta',
  },
  {
    index: '01.04',
    client: 'SMB Security Tool',
    role: 'Security Product · In Development',
    year: '2026',
    summary:
      'Enterprise-grade security for companies with 10–200 employees. One-click setup, automated scanning, reports a non-technical CEO can understand.',
    href: '#',
    image: '/img/opt/blog-endurance-640.avif',
    tag: 'In Development',
  },
];
