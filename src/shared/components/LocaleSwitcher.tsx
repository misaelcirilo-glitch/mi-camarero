'use client';
import { useState, useRef, useEffect } from 'react';
import { useI18n, LOCALE_LABELS, LOCALE_FLAGS } from '@/shared/lib/i18n';
import type { Locale } from '@/shared/lib/i18n';
import { Globe, ChevronDown } from 'lucide-react';

interface LocaleSwitcherProps {
    variant?: 'light' | 'dark';
}

export function LocaleSwitcher({ variant = 'dark' }: LocaleSwitcherProps) {
    const { locale, setLocale } = useI18n();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const isDark = variant === 'dark';

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs transition border ${
                    isDark
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
            >
                <Globe size={14} className={isDark ? 'text-orange-400' : 'text-orange-500'} />
                <span>{LOCALE_FLAGS[locale]}</span>
                <ChevronDown size={12} className="opacity-50" />
            </button>

            {open && (
                <div className={`absolute top-full right-0 mt-2 rounded-xl shadow-2xl z-50 min-w-[150px] overflow-hidden border ${
                    isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                }`}>
                    <div className="p-1.5">
                        {(Object.keys(LOCALE_LABELS) as Locale[]).map(l => (
                            <button
                                key={l}
                                onClick={() => { setLocale(l); setOpen(false); }}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                                    locale === l
                                        ? 'bg-orange-500/10 text-orange-500 font-bold'
                                        : isDark
                                            ? 'text-slate-300 hover:bg-slate-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <span>{LOCALE_FLAGS[l]}</span>
                                <span>{LOCALE_LABELS[l]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
