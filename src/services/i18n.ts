import { SupportedLocale } from '../types';
import { en, TranslationKey } from '../locales/en';
import { tr } from '../locales/tr';
import { es } from '../locales/es';

export type { TranslationKey };

const STORAGE_KEY = 'x2nostr_locale';

const dictionaries: Record<SupportedLocale, Record<TranslationKey, string>> = {
  en,
  tr,
  es,
};

type Listener = (locale: SupportedLocale) => void;

class I18nService {
  private currentLocale: SupportedLocale = 'en';
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.initLocale();
  }

  private initLocale(): void {
    if (typeof window === 'undefined') return;
    
    const saved = localStorage.getItem(STORAGE_KEY) as SupportedLocale | null;
    if (saved && (saved === 'en' || saved === 'tr' || saved === 'es')) {
      this.currentLocale = saved;
      return;
    }

    const browserLang = navigator.language?.toLowerCase() || '';
    if (browserLang.startsWith('tr')) {
      this.currentLocale = 'tr';
    } else if (browserLang.startsWith('es')) {
      this.currentLocale = 'es';
    } else {
      this.currentLocale = 'en';
    }
  }

  public getLocale(): SupportedLocale {
    return this.currentLocale;
  }

  public setLocale(locale: SupportedLocale): void {
    if (this.currentLocale === locale) return;
    this.currentLocale = locale;
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, locale);
    }
    this.notifyListeners();
  }

  public t(key: TranslationKey, params?: Record<string, string | number>): string {
    const dict = dictionaries[this.currentLocale] || dictionaries.en;
    let text = dict[key] || dictionaries.en[key] || String(key);

    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(value));
      });
    }

    return text;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach((listener) => {
      try {
        listener(this.currentLocale);
      } catch (err) {
        console.error('Error in i18n subscriber:', err);
      }
    });
  }
}

export const i18n = new I18nService();
export const t = (key: TranslationKey, params?: Record<string, string | number>) => i18n.t(key, params);
