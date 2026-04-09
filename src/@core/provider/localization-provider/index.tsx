"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import axios from "axios";
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
  const [currentLanguage, setCurrentLanguage] = useState("vi");

  useEffect(() => {
    const initI18n = async () => {
      const lang = (localStorage.getItem(LANGUAGE_KEY) || "vi").toLowerCase();
      localStorage.setItem(LANGUAGE_KEY, lang);

      // Keep ABP culture cookie in sync for compatibility with endpoints that still read it.
      const cultureCookie = `c=${lang}|uic=${lang}`;
      document.cookie = `.AspNetCore.Culture=${cultureCookie}; path=/; max-age=31536000`;

      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/abp/application-configuration`,
          {
            headers: {
              "Accept-Language": lang,
            },
          }
        );

        const resources = response.data.localization.resources;
        const i18nResources: any = {};

        // Merge all resources from ABP into i18next format
        Object.keys(resources).forEach((resourceName) => {
          const texts = resources[resourceName].texts;
          if (!i18nResources[lang]) {
            i18nResources[lang] = { translation: { ...(lang === "vi" ? viLocales : enLocales) } };
          }

          Object.keys(texts).forEach((key) => {
            // We use the key as is, or you can namespace it by resourceName if needed
            // For simplicity and since we usually want global keys:
            i18nResources[lang].translation[key] = texts[key];
          });
        });

        await i18n
          .use(initReactI18next)
          .init({
            resources: i18nResources,
            lng: lang,
            fallbackLng: "vi",
            interpolation: {
              escapeValue: false,
            },
            react: {
              useSuspense: false,
            },
          });

        setCurrentLanguage(lang);
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load localization:", error);
        // Fallback init if API fails
        await i18n.use(initReactI18next).init({
          resources: {
            vi: { translation: { "Language": "Ngôn ngữ", ...viLocales } },
            en: { translation: { "Language": "Language", ...enLocales } },
          },
          lng: lang,
          fallbackLng: "vi",
        });
        setCurrentLanguage(lang);
        setIsLoaded(true);
      }
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
