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
  /** The two sides. Title and description are what search results and
   *  link previews (LinkedIn, WhatsApp, Instagram) show for each route. */
  sides: {
    on: {
      path: '/',
      label: 'On track',
      title: 'Maximilian Richter — On Track',
      description:
        'Building in public toward KAT100: 81 km through the Kitzbühel Alps, ' +
        'starting at midnight. Race reports, monthly updates and live training ' +
        'numbers. Off track: IT security student at Bosch.',
    },
    off: {
      path: '/off-track',
      label: 'Off track',
      title: 'Maximilian Richter — Off Track · IT security',
      description:
        'Dual B.Sc. Computer Science with an IT security focus at Bosch and ' +
        'DHBW Ravensburg. Heading for AI security: agent evaluations, ' +
        'detection engineering, attack surface.',
    },
  },
  bibNumber: '204',
  repo: 'https://github.com/richter-max/PortfolioSite',
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
