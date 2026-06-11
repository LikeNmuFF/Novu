import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './translations/en.json';
import fil from './translations/fil.json';
import chavacano from './translations/chavacano.json';
import yakan from './translations/yakan.json';
import tausug from './translations/tausug.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    fil: { translation: fil },
    chav: { translation: chavacano },
    yak: { translation: yakan },
    tau: { translation: tausug },
  },
  lng: 'fil',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
