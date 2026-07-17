export interface PhoneCode {
  value: string;
  label: string;
  selected?: boolean;
}

export const phoneCodes: PhoneCode[] = [
  { value: '+1', label: '🇺🇸 +1' },
  { value: '+55', label: '🇧🇷 +55', selected: true },
  { value: '+44', label: '🇬🇧 +44' },
  { value: '+351', label: '🇵🇹 +351' },
  { value: '+34', label: '🇪🇸 +34' },
  { value: '+49', label: '🇩🇪 +49' },
  { value: '+39', label: '🇮🇹 +39' },
  { value: '+33', label: '🇫🇷 +33' },
  { value: '+52', label: '🇲🇽 +52' },
  { value: '+54', label: '🇦🇷 +54' },
  { value: '+56', label: '🇨🇱 +56' },
  { value: '+57', label: '🇨🇴 +57' },
  { value: '+61', label: '🇦🇺 +61' },
  { value: '+81', label: '🇯🇵 +81' },
  { value: '+86', label: '🇨🇳 +86' },
  { value: '+91', label: '🇮🇳 +91' },
  { value: '+7', label: '🇷🇺 +7' },
  { value: '+353', label: '🇮🇪 +353' },
  { value: '+31', label: '🇳🇱 +31' },
  { value: '+32', label: '🇧🇪 +32' },
  { value: '+41', label: '🇨🇭 +41' },
  { value: '+43', label: '🇦🇹 +43' },
  { value: '+46', label: '🇸🇪 +46' },
  { value: '+47', label: '🇳🇴 +47' },
  { value: '+48', label: '🇵🇱 +48' },
  { value: '+358', label: '🇫🇮 +358' },
];
