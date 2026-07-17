/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_TITLE: string;
  readonly VITE_PERSON_NAME: string;
  readonly VITE_CONTACT_EMAIL: string;
  readonly VITE_CONTACT_PHONE_DISPLAY: string;
  readonly VITE_CONTACT_PHONE_TEL: string;
  readonly VITE_INSTAGRAM_URL: string;
  readonly VITE_FORMSPREE_ACTION: string;
  readonly VITE_FORM_SUBJECT: string;
  readonly VITE_COMPANY_NAME: string;
  readonly VITE_COPYRIGHT_YEAR: string;
  readonly VITE_VIDEO_BADGE: string;
  readonly VITE_VIDEO_TITLE: string;
  readonly VITE_VIDEO_SECTION_HEADING: string;
  readonly VITE_VIDEO_SECTION_HIGHLIGHT: string;
  readonly VITE_VIDEO_DESCRIPTION: string;
  readonly VITE_VIDEO_SRC: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
