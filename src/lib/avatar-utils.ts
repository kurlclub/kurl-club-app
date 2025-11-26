// Distinct subtle color palette
const SUBTLE_COLORS = [
  '#708993', // Blue-gray
  '#A1C2BD', // Sage green
  '#C1856D', // Terracotta
  '#E8DFCA', // Warm beige
  '#896C6C', // Dusty rose
  '#6D94C5', // Soft blue
  '#B8A9C9', // Soft purple
  '#8B7355', // Warm brown
  '#7B9B7B', // Forest green
  '#A67C8A', // Mauve
  '#6B8CAE', // Steel blue
  '#D4B896', // Golden sand
];

// Calculate luminance to determine text color
const getLuminance = (hex: string) => {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const [rs, gs, bs] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  );

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

// Get contrasting text color
const getTextColor = (bgHex: string) => {
  const luminance = getLuminance(bgHex);
  return luminance > 0.5 ? '#1f2937' : '#f9fafb'; // Dark or light text
};

// Generate consistent color based on name
export const getAvatarColor = (name: string) => {
  if (!name) {
    const bgColor = SUBTLE_COLORS[0];
    return {
      backgroundColor: bgColor,
      color: getTextColor(bgColor),
    };
  }

  // Create a simple hash from the name
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use absolute value to ensure positive index
  const index = Math.abs(hash) % SUBTLE_COLORS.length;
  const bgColor = SUBTLE_COLORS[index];

  return {
    backgroundColor: bgColor,
    color: getTextColor(bgColor),
  };
};

// Get uppercase initials
export const getInitials = (name: string) => {
  if (!name) return 'UN';

  return name
    .split(' ')
    .map((word) => word.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase();
};
