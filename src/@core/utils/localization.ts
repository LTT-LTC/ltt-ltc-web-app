import { LANGUAGE_KEY } from "../const";
import enLocales from "../../locales/en.json";
import viLocales from "../../locales/vi.json";

type TranslationParams = Record<string, string | number>;

const DEFAULT_LANGUAGE = "vi";

function getCurrentLanguage() {
    if (typeof window === "undefined") {
        return DEFAULT_LANGUAGE;
    }

    return (localStorage.getItem(LANGUAGE_KEY) || DEFAULT_LANGUAGE)
        .toLowerCase()
        .split("-")[0];
}

function getLocaleDictionary(language: string) {
    return language === "en" ? enLocales : viLocales;
}

function getValueByPath(source: unknown, key: string): unknown {
    return key.split(".").reduce<unknown>((current, part) => {
        if (!current || typeof current !== "object") {
            return undefined;
        }

        return (current as Record<string, unknown>)[part];
    }, source);
}

function interpolate(template: string, params?: TranslationParams) {
    if (!params) {
        return template;
    }

    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, token: string) => {
        if (Object.prototype.hasOwnProperty.call(params, token)) {
            return String(params[token]);
        }

        return `{{${token}}}`;
    });
}

export function translate(key: string, fallback?: string, params?: TranslationParams) {
    const language = getCurrentLanguage();
    const dictionary = getLocaleDictionary(language);
    const value = getValueByPath(dictionary, key);

    if (typeof value === "string" && value.trim()) {
        return interpolate(value, params);
    }

    return fallback || key;
}
