// site.ts — site-wide metadata.
// Framing rule for every string in this file: state actual status,
// no consultant language, no adjectives doing the work of facts.

export const SITE = {
  url: 'https://richtermax.com',
  name: 'Maximilian Richter',
  title: 'Maximilian Richter — AI agent security',
  description:
    'Maximilian Richter works on AI agent security — prompt injection, tool ' +
    'misuse, and how you measure whether a defense works. Software developer ' +
    '(Ausbildung, 2026); dual B.Sc. Computer Science at Bosch from October ' +
    '2026. Endurance athlete. Based in the Allgäu.',
  author: {
    name: 'Maximilian Richter',
    email: 'max.richter.dev@proton.me',
    github: 'https://github.com/richter-max',
    linkedin: 'https://www.linkedin.com/in/maximilian-richter-40697a298',
  },
  // Legal — carried over from v1, used by /impressum and /datenschutz.
  legal: {
    fullName: 'Maximilian Richter',
    street: 'Ahornweg 1',
    postalCode: '87549',
    city: 'Rettenberg',
    country: 'Deutschland',
    phone: '',
    vatId: '',
    responsibleName: 'Maximilian Richter',
  },
} as const;
