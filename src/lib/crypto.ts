const SECRET_KEY = 'kurl-club-secret-key-2025';

export const encrypt = (text: string): string => {
  try {
    const encoded = btoa(text + SECRET_KEY);
    return encoded;
  } catch {
    return text;
  }
};

export const decrypt = (encoded: string): string => {
  try {
    const decoded = atob(encoded);
    return decoded.replace(SECRET_KEY, '');
  } catch {
    return '';
  }
};
