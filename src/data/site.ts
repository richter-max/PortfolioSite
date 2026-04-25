export const SITE = {
  url: 'https://richtermax.com',
  name: 'Maximilian Richter',
  title: 'Maximilian Richter — Security Engineer · Endurance Athlete',
  description:
    'Security engineer working on AI agent security and tooling. Endurance athlete. Based in the Allgäu.',
  ogImage: '/img/og-default.jpg',
  author: {
    name: 'Maximilian Richter',
    handle: '@richtermax',
    email: 'max.richter.dev@proton.me',
  },
  // Legal — used by /impressum and /datenschutz. §5 TMG requires the
  // physical postal address of the natural person responsible for the
  // site to be reachable here. Fill in before going live.
  legal: {
    fullName: 'Maximilian Richter',
    street: '[STRASSE + HAUSNUMMER]',
    postalCode: '[PLZ]',
    city: '[ORT]',
    country: 'Deutschland',
    phone: '', // optional — leave '' to hide
    vatId: '', // optional USt-IdNr. — leave '' to hide
    // Person responsible per §18 Abs. 2 MStV (only if site has journalistic content)
    responsibleName: 'Maximilian Richter',
  },
} as const;

export type Site = typeof SITE;
