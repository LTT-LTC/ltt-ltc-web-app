"use client";

import { useTranslation as useI18nTranslation } from "react-i18next";
import { LANGUAGE_KEY } from "../const";

const DEFAULT_LANGUAGE = "vi";

/**
 * Custom hook for localization.
 * Wraps react-i18next's useTranslation but can be extended for LTC specific logic.
 */
export const useLocalization = (ns?: string) => {
  const { t, i18n } = useI18nTranslation(ns);

  const changeLanguage = async (lng: string) => {
    const normalizedLanguage = lng.toLowerCase();

    localStorage.setItem(LANGUAGE_KEY, normalizedLanguage);

    // ABP standard cookie for culture synchronization
    const cultureCookie = `c=${normalizedLanguage}|uic=${normalizedLanguage}`;
    document.cookie = `.AspNetCore.Culture=${cultureCookie}; path=/; max-age=31536000`;

    await i18n.changeLanguage(normalizedLanguage);

    // To ensure the ABP Backend localization dict is fully re-fetched for the new language
    // since the Index fetches it on mount based on the current cookie
    window.location.reload();
  };

  const currentLanguage = (i18n.language || localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE)
    .toLowerCase()
    .split("-")[0];

  return {
    t,
    i18n,
    currentLanguage,
    changeLanguage,
  };
};
