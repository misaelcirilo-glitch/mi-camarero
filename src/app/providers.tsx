'use client';
import { I18nContext, useI18nProvider } from '@/shared/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
    const i18n = useI18nProvider();
    return (
        <I18nContext.Provider value={i18n}>
            {children}
        </I18nContext.Provider>
    );
}
