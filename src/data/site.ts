export const SITE = {
  url: 'https://richtermax.com',
  name: 'Maximilian Richter',
  title: 'Maximilian Richter — Security Engineer · Endurance Athlete',
  description:
    'Systems that perform when they cannot fail. Hardened against adversaries. Tested in the cold.',
  ogImage: '/img/og-default.jpg',
  author: {
    name: 'Maximilian Richter',
    handle: '@richtermax',
    email: 'max.richter.dev@proton.me',
  },
} as const;

export type Site = typeof SITE;
