import dayjs, { Dayjs } from "dayjs";
import { validation } from "./validation";

type ObjectWithStrings = {
  [key: string]: string | ObjectWithStrings | any[];
};
function trimStringsInObject<T extends ObjectWithStrings>(obj: T): T {
  const trimmed = { ...obj };

  for (const key in trimmed) {
    const value = trimmed[key];

    if (dayjs.isDayjs(value)) {
      trimmed[key] = value.toISOString() as T[Extract<keyof T, string>];
    } else if (typeof value === "string") {
      // Trim string values
      trimmed[key] = value.trim() as T[Extract<keyof T, string>];
    } else if (Array.isArray(value)) {
      // Handle arrays recursively
      trimmed[key] = value.map((item) => {
        if (dayjs.isDayjs(item)) return item.toISOString();
        if (typeof item === "string") return item.trim();
        if (validation.isObject(item)) return trimStringsInObject(item);
        return item;
      }) as T[Extract<keyof T, string>];
    } else if (validation.isObject(value)) {
      // Handle nested objects recursively
      trimmed[key] = trimStringsInObject(value) as T[Extract<keyof T, string>];
    }
  }

  return trimmed;
}

export const convert = {
    trimStringsInObject,
}