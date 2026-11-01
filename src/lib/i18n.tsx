"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { DICT, type Dict, type Lang } from "@/data/dict";

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: Dict };

const LangContext = createContext<Ctx | null>(null);
const STORAGE_KEY = "kryx-lang";

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Default to EN for a stable first paint (avoids hydration mismatch);
  // refine from storage / browser after mount.
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const stored = (typeof window !== "undefined" &&
      localStorage.getItem(STORAGE_KEY)) as Lang | null;
    if (stored === "en" || stored === "ru") {
      setLangState(stored);
    } else if (typeof navigator !== "undefined" && navigator.language.startsWith("ru")) {
      setLangState("ru");
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t: DICT[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): Ctx {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error("useLang must be used within LanguageProvider");
  return ctx;
}

/** Convenience: just the dictionary for the current language. */
export function useT(): Dict {
  return useLang().t;
}
