import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './en.json';
import translationDE from './de.json';
import translationES from './es.json';

const resources = {
  en: {
    translation: translationEN
  },
  de: {
    translation: translationDE
  },
  es: {
    translation: translationES
  }
};

const initialLanguage = localStorage.getItem('storageLanguage') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
