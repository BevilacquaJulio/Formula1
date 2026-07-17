function env(key: string, fallback: string): string {
  const value = import.meta.env[key];
  if (typeof value === 'string' && value.trim() !== '') return value.trim();
  return fallback;
}

export const siteConfig = {
  siteTitle: env('VITE_SITE_TITLE', 'Racer Name — Motor Racing Performance'),
  personName: env('VITE_PERSON_NAME', 'Racer Name'),
  contactEmail: env('VITE_CONTACT_EMAIL', 'contact@example.com'),
  contactPhoneDisplay: env('VITE_CONTACT_PHONE_DISPLAY', '+1 (000) 000-0000'),
  contactPhoneTel: env('VITE_CONTACT_PHONE_TEL', '+10000000000'),
  instagramUrl: env('VITE_INSTAGRAM_URL', 'https://instagram.com/yourprofile'),
  formspreeAction: env('VITE_FORMSPREE_ACTION', 'https://formspree.io/f/YOUR_FORM_ID'),
  formSubject: env('VITE_FORM_SUBJECT', 'New contact - Website'),
  companyName: env('VITE_COMPANY_NAME', 'Racing LLC'),
  copyrightYear: env('VITE_COPYRIGHT_YEAR', String(new Date().getFullYear())),
  videoBadge: env('VITE_VIDEO_BADGE', 'Racing Team'),
  videoSectionHeading: env('VITE_VIDEO_SECTION_HEADING', 'Race Highlight'),
  videoSectionHighlight: env('VITE_VIDEO_SECTION_HIGHLIGHT', "'97"),
  videoTitle: env('VITE_VIDEO_TITLE', 'Race Highlight — Championship'),
  videoDescription: env('VITE_VIDEO_DESCRIPTION', 'Race Footage · Team Archive'),
  videoSrc: env('VITE_VIDEO_SRC', '/video/race-footage.mp4'),
} as const;

export function isFormConfigured(): boolean {
  return !siteConfig.formspreeAction.includes('YOUR_FORM_ID');
}
