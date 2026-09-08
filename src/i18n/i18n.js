import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './en.json';
import translationTA from './ta.json';
import translationTE from './te.json';
import translationKN from './kn.json';
import translationML from './ml.json';
import translationHI from './hi.json';

const resources = {
  en: {
    translation: translationEN
  },
  ta: {
    translation: translationTA
  },
  te: {
    translation: translationTE
  },
  kn: {
    translation: translationKN
  },
  ml: {
    translation: translationML
  },
  hi: {
    translation: translationHI
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
