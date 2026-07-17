export interface ServiceItem {
  title: string;
  description: string;
}

export const services: ServiceItem[] = [
  {
    title: 'COACHING',
    description:
      'From Go-Karts and Junior Formulas to Endurance Racing, helping drivers of all ages and skills achieve optimal results.',
  },
  {
    title: 'PERFORMANCE',
    description:
      'Race engineer support with advanced racecar data analysis and track data correlation to improve lap times.',
  },
  {
    title: 'CONSULTING',
    description:
      'Racetrack design updates, team selection for young drivers, and racing equipment sourcing.',
  },
];

/** Conquistas de exemplo — substitua pelos dados reais do cliente */
export const achievements: string[] = [
  'National Formula Champion - 20XX',
  'Series Rookie of the Year - 20XX',
  'Major Championship Finalist - 20XX',
];
