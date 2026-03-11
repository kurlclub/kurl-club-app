import countries from 'world-countries';

type Option = {
  label: string;
  value: string;
};

const getCurrencyName = (currencyCode: string) => {
  try {
    return (
      new Intl.DisplayNames(['en'], { type: 'currency' }).of(currencyCode) ||
      currencyCode
    );
  } catch {
    return currencyCode;
  }
};

const getCurrencySymbol = (currencyCode: string) => {
  try {
    const parts = new Intl.NumberFormat('en', {
      style: 'currency',
      currency: currencyCode,
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(1);

    return parts.find((part) => part.type === 'currency')?.value || '';
  } catch {
    return '';
  }
};

export const REGIONS: Option[] = countries
  .map((country) => ({
    label: `${country.name.common} (${country.cca3})`,
    value: country.cca3,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const CURRENCIES: Option[] = Array.from(
  new Set(
    countries.flatMap((country) =>
      country.currencies ? Object.keys(country.currencies) : []
    )
  )
)
  .map((currencyCode) => {
    const symbol = getCurrencySymbol(currencyCode);
    const name = getCurrencyName(currencyCode);

    return {
      label: `${symbol ? `${symbol} ` : ''}${name} (${currencyCode})`,
      value: currencyCode,
    };
  })
  .sort((a, b) => a.label.localeCompare(b.label));

export const COUNTRY_CODES: Option[] = Array.from(
  new Map(
    countries
      .flatMap((country) => {
        const root = country.idd?.root;
        const suffixes = country.idd?.suffixes || [];

        if (!root || suffixes.length === 0) return [];

        return suffixes.map((suffix) => {
          const dialCode = `${root}${suffix}`;
          return {
            value: dialCode,
            label: `${country.name.common} (${dialCode})`,
          };
        });
      })
      .map((item) => [item.value, item])
  ).values()
)
  .filter((item) => /^\+\d+$/.test(item.value))
  .sort((a, b) => {
    const left = Number(a.value.replace('+', ''));
    const right = Number(b.value.replace('+', ''));
    return left - right;
  });
