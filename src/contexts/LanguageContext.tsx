import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'rw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'nav.home': 'Home',
    'nav.marketplace': 'Marketplace',
    'nav.products': 'Products',
    'nav.categories': 'Categories',
    'nav.market_prices': 'Market Prices',
    'nav.plant_health': 'Plant Health & Pests',
    'nav.crop_calendar': 'Crop Calendar',
    'nav.weather': 'Weather',
    'nav.buyer_login': 'Buyer Login',
    'nav.seller_login': 'Seller Login',
    'nav.account': 'Account',
    'home.hero_title': 'The Premier Agricultural Technology Marketplace',
    'home.hero_subtitle': 'Connecting farmers, buyers, and technology across Rwanda and beyond. High-quality produce, intelligent tools, and secure trading.',
    'home.search_placeholder': 'Search products, brands, or categories...',
    'home.shop_now': 'Shop Fresh Produce',
    'home.explore_tools': 'Explore Smart Tools',
    'home.featured_categories': 'Featured Categories',
    'home.fresh_produce': 'Fresh Produce',
    'home.seeds_plants': 'Seeds & Plants',
    'home.fertilizers': 'Fertilizers',
    'home.farm_tools': 'Farm Tools',
    'home.livestock': 'Livestock & Feed',
    'home.trending_products': 'Trending Products',
    'home.load_more': 'Load More Products',
    'home.best_selling': 'Best Selling',
    'home.new_arrivals': 'New Arrivals',
    'home.recommended': 'Recommended & Recent',
    'home.reviews_title': 'What Our Buyers Say',
    'home.reviews_subtitle': 'Real reviews from verified purchases across our farm network.',
    'home.fast_delivery': 'Fast Delivery',
    'home.fast_delivery_desc': 'Direct from farm to your door',
    'home.live_chat': 'Live Chat Support',
    'home.live_chat_desc': 'We\'re here to help 24/7',
    'home.secure_payments': 'Secure Payments',
    'home.secure_payments_desc': '100% secure checkout',
    'home.return_refund': 'Return & Refund',
    'home.return_refund_desc': 'Money-back guarantee',
    'ai.ask': 'Ask AgroNavo AI...',
    'ai.thinking': 'AgroNavo AI is thinking...',
    'ai.suggested.plant_health': '🌱 Plant Health',
    'ai.suggested.market_prices': '💰 Market Prices',
    'ai.suggested.weather': '🌦️ Weather',
    'ai.suggested.products': '🛒 Products',
  },
  rw: {
    'nav.home': 'Ahabanza',
    'nav.marketplace': 'Isoko',
    'nav.products': 'Ibicuruzwa',
    'nav.categories': 'Ibyiciro',
    'nav.market_prices': 'Ibiciro ku Isoko',
    'nav.plant_health': 'Ubuzima bw\'Ibimera',
    'nav.crop_calendar': 'Ikoranabuhanga ry\'Igihe',
    'nav.weather': 'Iteganyagihe',
    'nav.buyer_login': 'Kwinjira k\'Umuguzi',
    'nav.seller_login': 'Kwinjira k\'Umuhinzi',
    'nav.account': 'Konti Yanjye',
    'home.hero_title': 'Isoko rya Mbere ry\'Ikoranabuhanga mu Buhinzi',
    'home.hero_subtitle': 'Guhuza abahinzi, abaguzi, n\'ikoranabuhanga mu Rwanda no hanze yaho. Umusaruro mwiza, ibikoresho by\'ikoranabuhanga, n\'ubucuruzi bwizewe.',
    'home.search_placeholder': 'Shakisha ibicuruzwa, am표, cyangwa ibyiciro...',
    'home.shop_now': 'Gura Umusaruro Mwiza',
    'home.explore_tools': 'Koresha Ikoranabuhanga',
    'home.featured_categories': 'Ibyiciro by\'Ingenzi',
    'home.fresh_produce': 'Umusaruro Mushya',
    'home.seeds_plants': 'Imbuto n\'Ingemwe',
    'home.fertilizers': 'Ifumbire',
    'home.farm_tools': 'Ibikoresho by\'Ubuhinzi',
    'home.livestock': 'Amatungo n\'Ibiryo byayo',
    'home.trending_products': 'Ibicuruzwa Bigezweho',
    'home.load_more': 'Reba Ibindi Bicuzwa',
    'home.best_selling': 'Ibigurwa Cyane',
    'home.new_arrivals': 'Ibije Vuba',
    'home.recommended': 'Ibyo Tuguhitiyemo',
    'home.reviews_title': 'Icyo Abaguzi Bacu Bavuga',
    'home.reviews_subtitle': 'Ibitecyerezo bya nyabyo by\'abaguzi banyuze mu isoko ryacu.',
    'home.fast_delivery': 'Kugezwaho Vuba',
    'home.fast_delivery_desc': 'Biva mu murima bigera iwawe',
    'home.live_chat': 'Ubufasha Bwihuse',
    'home.live_chat_desc': 'Turi hano kugufasha 24/7',
    'home.secure_payments': 'Kwishyura Mu Mutekano',
    'home.secure_payments_desc': 'Kwishyura byizewe 100%',
    'home.return_refund': 'Gusubizwa Amafaranga',
    'home.return_refund_desc': 'Wizeye gusubizwa niba utishimiye',
    'ai.ask': 'Baza AgroNavo AI...',
    'ai.thinking': 'AgroNavo AI irimo gutekereza...',
    'ai.suggested.plant_health': '🌱 Ubuzima bw\'Ibimera',
    'ai.suggested.market_prices': '💰 Ibiciro',
    'ai.suggested.weather': '🌦️ Iteganyagihe',
    'ai.suggested.products': '🛒 Ibicuruzwa',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('agronavo_lang') as Language;
    if (savedLang && (savedLang === 'en' || savedLang === 'rw')) {
      setLanguage(savedLang);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('agronavo_lang', lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
