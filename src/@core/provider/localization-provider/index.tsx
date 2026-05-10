"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { LANGUAGE_KEY } from "../../const";
import enLocales from "../../../locales/en.json";
import viLocales from "../../../locales/vi.json";

const LocalizationContext = createContext<{
  isLoaded: boolean;
  currentLanguage: string;
} | null>(null);

export const Index: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");

  useEffect(() => {
    const initI18n = async () => {
      const lang = (localStorage.getItem(LANGUAGE_KEY) || "en").toLowerCase();
      localStorage.setItem(LANGUAGE_KEY, lang);

      // Keep ABP culture cookie in sync for compatibility with endpoints that still read it.
      const cultureCookie = `c=${lang}|uic=${lang}`;
      document.cookie = `.AspNetCore.Culture=${cultureCookie}; path=/; max-age=31536000`;

      await i18n
        .use(initReactI18next)
        .init({
          resources: {
            vi: { translation: { "Language": "Tiếng Việt", ...viLocales } },
            en: { translation: { "Language": "English", ...enLocales } },
          },
          lng: lang,
          fallbackLng: "en",
          interpolation: {
            escapeValue: false,
          },
          react: {
            useSuspense: false,
          },
        });

      setCurrentLanguage(lang);
      setIsLoaded(true);
    };

    initI18n();
  }, []);

  return (
    <LocalizationContext.Provider value={{ isLoaded, currentLanguage }}>
      {isLoaded ? children : null}
    </LocalizationContext.Provider>
  );
};

export const useLocalizationStatus = () => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error("useLocalizationStatus must be used within a Index");
  }
  return context;
};
