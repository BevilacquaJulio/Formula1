export interface TimelineItem {
  year: string;
  title: string;
  subtitle?: string;
  badge?: string;
  sabbatical?: boolean;
}

/** Conteúdo de exemplo — substitua pela carreira do cliente em src/data/timeline.ts */
export const racingCareer: TimelineItem[] = [
  { year: '20XX to 20XX', title: 'National Formula Series' },
  { year: '20XX', title: 'International Formula Championship' },
  {
    year: '20XX to 20XX',
    title: 'Regional Formula Championship',
    badge: 'Champion 20XX',
  },
  { year: '20XX to 20XX', title: 'Sabbatical', sabbatical: true },
  {
    year: '20XX',
    title: 'Pro Racing Series',
    badge: 'Rookie of the Year · Top 3 in Championship',
  },
  { year: '20XX', title: 'Professional Racing League' },
  {
    year: '20XX',
    title: 'Professional Racing League',
    badge: 'Major Race Event',
  },
];

export const workExperience: TimelineItem[] = [
  {
    year: '20XX',
    title: 'Junior Racing Championship',
    subtitle: 'Driver Coach and Technical Consultant',
  },
  {
    year: '20XX',
    title: 'National Stock Car Championship',
    subtitle: 'Data Analysis – Racing Team',
  },
  {
    year: '20XX to 20XX',
    title: 'National Stock Car Championship',
    subtitle: 'Racing Engineer and Data Analysis – Racing Team',
  },
  {
    year: '20XX to 20XX',
    title: 'GT Cup Series',
    subtitle: 'Instructor Driver / Driver Coach',
  },
];

export const GALLERY_COUNT = 21;
