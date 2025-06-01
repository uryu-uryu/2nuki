import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { jaTranslations, enTranslations } from 'src/i18n/locales';
import type { InitOptions } from 'i18next';

// i18nextの初期化オプション
const i18nextOptions: InitOptions = {
  fallbackLng: 'ja',
  resources: {
    ja: jaTranslations,
    en: enTranslations
  },
  detection: {
    // 言語検出の優先順位
    order: ['localStorage', 'navigator'],
    // LocalStorageのキー
    lookupLocalStorage: 'i18nextLng',
    // キャッシュ有効期限（分）
    caches: ['localStorage'],
    cookieMinutes: 43200 // 30日
  }
};

// i18nextの初期化
i18next
  .use(LanguageDetector)
  .init(i18nextOptions);

export default i18next; 