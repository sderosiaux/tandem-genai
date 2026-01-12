interface FlagIconProps {
  countryCode: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-xl',
  lg: 'text-2xl',
}

// Mapping des codes ISO vers les emoji drapeaux
const countryToFlag: Record<string, string> = {
  US: '\u{1F1FA}\u{1F1F8}', // 🇺🇸
  BR: '\u{1F1E7}\u{1F1F7}', // 🇧🇷
  DE: '\u{1F1E9}\u{1F1EA}', // 🇩🇪
  JP: '\u{1F1EF}\u{1F1F5}', // 🇯🇵
  GB: '\u{1F1EC}\u{1F1E7}', // 🇬🇧
  IT: '\u{1F1EE}\u{1F1F9}', // 🇮🇹
  FR: '\u{1F1EB}\u{1F1F7}', // 🇫🇷
  ES: '\u{1F1EA}\u{1F1F8}', // 🇪🇸
  CA: '\u{1F1E8}\u{1F1E6}', // 🇨🇦
  CN: '\u{1F1E8}\u{1F1F3}', // 🇨🇳
  RU: '\u{1F1F7}\u{1F1FA}', // 🇷🇺
  KR: '\u{1F1F0}\u{1F1F7}', // 🇰🇷
  MX: '\u{1F1F2}\u{1F1FD}', // 🇲🇽
  IN: '\u{1F1EE}\u{1F1F3}', // 🇮🇳
  AU: '\u{1F1E6}\u{1F1FA}', // 🇦🇺
}

export function FlagIcon({
  countryCode,
  className = '',
  size = 'md',
}: FlagIconProps) {
  const flag = countryToFlag[countryCode.toUpperCase()] || '🏳️'

  return (
    <span
      className={`${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={`Flag of ${countryCode}`}
    >
      {flag}
    </span>
  )
}
