import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      // Index page
      "pageTitle": "Face Analysis",
      "pageDescription": "Upload your image to receive detailed analysis of your skin health and personalized recommendations",
      "analyzing": "Analyzing your image...",
      "signOut": "Sign Out",
      "signIn": "Sign In",
      "community": "Community",
      
      // ImageUpload
      "dropImage": "Drop your image here",
      "dragOrClick": "Drag and drop your image here",
      "orClickToSelect": "or click to select file",
      
      // AnalysisResult
      "hydration": "Hydration",
      "clarity": "Clarity",
      "texture": "Texture",
      "acne": "Acne",
      "wrinkles": "Wrinkles",
      "darkCircles": "Dark Circles",
      "skinConcerns": "Skin Concerns",
      "recommendations": "Recommendations",
      "higherIsBetter": "Higher = Better",
      
      // Toast messages
      "analysisFailed": "Analysis Failed",
      "analysisFailedDesc": "There was an error analyzing your image. Please try again.",
      "success": "Success",
      "signedOut": "You have been signed out",
    }
  },
  ar: {
    translation: {
      // Index page
      "pageTitle": "تحليل الوجه",
      "pageDescription": "قم بتحميل صورتك للحصول على تحليل مفصل لصحة بشرتك وتوصيات شخصية",
      "analyzing": "جاري تحليل صورتك...",
      "signOut": "تسجيل الخروج",
      "signIn": "تسجيل الدخول",
      "community": "المجتمع",
      
      // ImageUpload
      "dropImage": "أسقط صورتك هنا",
      "dragOrClick": "اسحب وأسقط صورتك هنا",
      "orClickToSelect": "أو انقر لاختيار ملف",
      
      // AnalysisResult
      "hydration": "الترطيب",
      "clarity": "النقاء",
      "texture": "الملمس",
      "acne": "حب الشباب",
      "wrinkles": "التجاعيد",
      "darkCircles": "الهالات السوداء",
      "skinConcerns": "مشاكل البشرة",
      "recommendations": "التوصيات",
      "higherIsBetter": "الأعلى = الأفضل",
      
      // Toast messages
      "analysisFailed": "فشل التحليل",
      "analysisFailedDesc": "حدث خطأ أثناء تحليل صورتك. يرجى المحاولة مرة أخرى.",
      "success": "نجح",
      "signedOut": "تم تسجيل خروجك",
    }
  },
  so: {
    translation: {
      // Index page
      "pageTitle": "Falanqaynta Wejiga",
      "pageDescription": "Soo rar sawirkaaga si aad u hesho falanqayn faahfaahsan oo ku saabsan caafimaadka maqaarkaaga iyo talooyinka gaarka ah",
      "analyzing": "Sawirkaaga waan ku falanqaynaynaa...",
      "signOut": "Ka Bax",
      "signIn": "Gal",
      "community": "Bulshada",
      
      // ImageUpload
      "dropImage": "Halkan dhig sawirkaaga",
      "dragOrClick": "Sawirkaaga halkan soo jiid ama riix",
      "orClickToSelect": "ama guji si aad u doorato faylka",
      
      // AnalysisResult
      "hydration": "Qoyaan",
      "clarity": "Nadiifnimo",
      "texture": "Dhadhanka",
      "acne": "Finfinow",
      "wrinkles": "Jiiqid",
      "darkCircles": "Gariir Madow",
      "skinConcerns": "Walaacyo Maqaarka",
      "recommendations": "Talooyinka",
      "higherIsBetter": "Sare = Wanaagsan",
      
      // Toast messages
      "analysisFailed": "Falanqayntu Waa Fashilantay",
      "analysisFailedDesc": "Waxaa jirtay khalad la falanqaynaya sawirkaaga. Fadlan mar kale isku day.",
      "success": "Guul",
      "signedOut": "Waad ka baxday",
    }
  }
};

// Arabic-speaking countries locale codes
const arabicLocales = [
  'ar', 'ar-SA', 'ar-AE', 'ar-BH', 'ar-DZ', 'ar-EG', 'ar-IQ', 'ar-JO', 
  'ar-KW', 'ar-LB', 'ar-LY', 'ar-MA', 'ar-OM', 'ar-QA', 'ar-SD', 'ar-SY', 
  'ar-TN', 'ar-YE'
];

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['navigator', 'htmlTag', 'path', 'subdomain'],
      caches: ['localStorage', 'cookie'],
    },
  });

// Auto-detect and set language based on browser locale
const detectedLanguage = navigator.language || navigator.languages?.[0];
if (detectedLanguage) {
  if (arabicLocales.some(locale => detectedLanguage.startsWith(locale.split('-')[0]))) {
    i18n.changeLanguage('ar');
  } else if (detectedLanguage.startsWith('so')) {
    i18n.changeLanguage('so');
  } else {
    i18n.changeLanguage('en');
  }
}

export default i18n;
