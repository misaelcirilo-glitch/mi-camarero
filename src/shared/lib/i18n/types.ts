export type Locale = 'es' | 'en' | 'pt';

export interface CurrencyConfig {
    code: string;
    symbol: string;
    locale: string;
}

export const COMMON_CURRENCIES: Record<string, CurrencyConfig> = {
    EUR: { code: 'EUR', symbol: '€', locale: 'es-ES' },
    USD: { code: 'USD', symbol: '$', locale: 'en-US' },
    GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
    MXN: { code: 'MXN', symbol: '$', locale: 'es-MX' },
    PEN: { code: 'PEN', symbol: 'S/', locale: 'es-PE' },
    COP: { code: 'COP', symbol: '$', locale: 'es-CO' },
    ARS: { code: 'ARS', symbol: '$', locale: 'es-AR' },
    CLP: { code: 'CLP', symbol: '$', locale: 'es-CL' },
    BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
    PYG: { code: 'PYG', symbol: '₲', locale: 'es-PY' },
    BOB: { code: 'BOB', symbol: 'Bs', locale: 'es-BO' },
    UYU: { code: 'UYU', symbol: '$U', locale: 'es-UY' },
};

export function getCurrencyConfig(code: string): CurrencyConfig {
    return COMMON_CURRENCIES[code] || { code, symbol: code, locale: 'en-US' };
}

export const LOCALE_LABELS: Record<Locale, string> = {
    es: 'Español',
    en: 'English',
    pt: 'Português',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
    es: '🇪🇸',
    en: '🇺🇸',
    pt: '🇧🇷',
};
