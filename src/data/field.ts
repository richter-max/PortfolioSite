export interface FieldStat {
  value: string;
  label: string;
}

export interface FieldEntry {
  index: string;
  title: string;
  location: string;
  date: string;
  conditions: string;
  image: string;
  imagePosition?: string;
  stats: FieldStat[];
}

export const fieldEntries: FieldEntry[] = [
  {
    index: '02.01',
    title: 'Ironman 70.3 Kraichgau',
    location: 'KRAICHGAU · DE',
    date: 'MAY 2026',
    conditions:
      '1.9km swim, 90km bike, 21.1km run. First half-iron finish. Target sub five hours. Fifteen-plus hours of training per week stacked on a full-time job.',
    image: '/img/opt/portrait-salomon-1280.avif',
    imagePosition: 'center 35%',
    stats: [
      { value: '≤ 5:00', label: 'TARGET' },
      { value: '211 km', label: 'TOTAL' },
    ],
  },
  {
    index: '02.02',
    title: 'Berlin Marathon',
    location: 'BERLIN · DE',
    date: 'SEP 2026',
    conditions:
      'Fastest course in the world. Target 4:16 per kilometer held across 42.195km — sub three hours, with a clean second half.',
    image: '/img/opt/berlin-marathon-1920.avif',
    imagePosition: 'center 40%',
    stats: [
      { value: '≤ 3:00:00', label: 'TARGET' },
      { value: '4:16/km', label: 'PACE' },
    ],
  },
  {
    index: '02.03',
    title: 'Table Tennis — Landesliga',
    location: 'BAYERN · DE',
    date: '2025/26 SEASON',
    conditions:
      'Ongoing league play with DJK Seifriedsberg. Current rating 1757, climbing toward 1800. Side sport, kept honest with weekly drills.',
    image: '/img/opt/tischtennis-1280.avif',
    imagePosition: 'center 62%',
    stats: [
      { value: '1,757', label: 'CURRENT' },
      { value: '1,800', label: 'TARGET' },
    ],
  },
];
