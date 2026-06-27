import countries from 'world-countries';

import { getCurrencySymbol } from './regional-options';

/**
 * A single country tying together everything the gym's regional settings need:
 * the display name + flag, the ISO currency (with symbol), the backend region
 * code, and the E.164 dial code. Mirrors the mobile app's `Country` type so the
 * web picker drives currency / region / country-code from one selection.
 */
export type Country = {
  /** Common country name, e.g. "India". */
  name: string;
  /** ISO 3166-1 alpha-2, e.g. "IN" (used as the stable id + flag fallback). */
  cca2: string;
  /** ISO 3166-1 numeric (UN) code, e.g. "356" — matches the world-atlas map feature id. */
  ccn3: string;
  /** ISO 3166-1 alpha-3, e.g. "IND" — the backend `region` value. */
  regionCode: string;
  /** ISO 4217 currency code, e.g. "INR". */
  currency: string;
  /** Currency symbol, e.g. "₹". */
  symbol: string;
  /** E.164 calling code, e.g. "+91". */
  callingCode: string;
  /** Emoji flag, e.g. "🇮🇳". */
  flag: string;
};

/**
 * Derives the E.164 calling code from a country's `idd` data. Countries with a
 * single suffix combine root + suffix (India: `+9` + `1` → `+91`); multi-suffix
 * countries (e.g. the US/NANP with hundreds of area codes) use the root alone
 * (`+1`).
 */
const resolveCallingCode = (
  root?: string,
  suffixes?: readonly string[]
): string => {
  if (!root) return '';
  if (suffixes && suffixes.length === 1) return `${root}${suffixes[0]}`;
  return root;
};

/**
 * Builds an emoji flag from an ISO alpha-2 code as a fallback when the dataset
 * has none. Returns a globe for invalid input.
 */
export const getFlagEmoji = (cca2?: string | null): string => {
  if (!cca2 || cca2.length !== 2) return '🌐';
  return cca2
    .toUpperCase()
    .split('')
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join('');
};

/**
 * All countries that have a currency, ready for the regional-settings picker.
 * Sorted by name. Each entry exposes currency, region (cca3), dial code, and a
 * flag so picking one country fills every regional field at once.
 */
export const COUNTRIES: Country[] = countries
  .flatMap((country) => {
    const currencyCode = country.currencies
      ? Object.keys(country.currencies)[0]
      : undefined;

    // Skip territories without a currency (Antarctica, etc.) — a gym can't bill
    // in "no currency".
    if (!currencyCode) return [];

    const currencyMeta = country.currencies?.[
      currencyCode as keyof typeof country.currencies
    ] as { symbol?: string } | undefined;

    return [
      {
        name: country.name.common,
        cca2: country.cca2,
        ccn3: country.ccn3,
        regionCode: country.cca3,
        currency: currencyCode,
        symbol:
          currencyMeta?.symbol ||
          getCurrencySymbol(currencyCode) ||
          currencyCode,
        callingCode: resolveCallingCode(
          country.idd?.root,
          country.idd?.suffixes
        ),
        flag: country.flag || getFlagEmoji(country.cca2),
      },
    ];
  })
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Resolves the country that best matches a gym's saved settings, preferring the
 * region code (alpha-3), then the currency, and finally falling back to India
 * (or the first country). Mirrors the mobile app's `resolveDefaultCountry`.
 */
export const resolveDefaultCountry = (match: {
  region?: string | null;
  currency?: string | null;
}): Country | undefined => {
  const { region, currency } = match;

  let result: Country | undefined;
  if (region) result = COUNTRIES.find((c) => c.regionCode === region);
  if (!result && currency)
    result = COUNTRIES.find((c) => c.currency === currency);
  if (!result) result = COUNTRIES.find((c) => c.cca2 === 'IN') ?? COUNTRIES[0];

  return result;
};
