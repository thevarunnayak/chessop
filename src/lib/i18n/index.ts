import { en } from "./en";

export type NestedKeyOf<ObjectType extends object> = {
  [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
    ? `${Key}.${NestedKeyOf<ObjectType[Key]>}`
    : `${Key}`;
}[keyof ObjectType & (string | number)];

export type TranslationKeyPath = NestedKeyOf<typeof en>;

export function t(path: TranslationKeyPath | string, params?: Record<string, string | number>): string {
  const keys = path.split(".");
  let current: any = en;

  for (const k of keys) {
    if (current && typeof current === "object" && k in current) {
      current = current[k];
    } else {
      return path; // Fallback to key path if missing
    }
  }

  if (typeof current !== "string") {
    return path;
  }

  let result = current;
  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, "g"), String(paramVal));
    });
  }

  return result;
}

export function useTranslation() {
  return { t };
}
