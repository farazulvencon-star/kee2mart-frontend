// Drop-in replacements for next/link and next/router that preserve the
// `lang` and `module` (slug) query params across navigations, so
// getServerSideProps receives the correct language and the active module
// travels with every link (shareable across modules, readable slug URLs).
import NextLink from "next/link";
import { useRouter as useNextRouter } from "next/router";
import { useSelector } from "react-redux";
import { slugFromModuleId } from "./moduleSlug";

const useLang = () => {
  const router = useNextRouter();
  const reduxLang = useSelector((s) => s.Language?.selectedLanguage?.code);
  return router.query.lang || reduxLang;
};

// The URL now carries the module SLUG (?module=grocery). Prefer the URL's slug,
// otherwise derive it from the active module id via the modules list.
const useModuleSlug = () => {
  const router = useNextRouter();
  const modules = useSelector((s) => s.Module?.modules);
  const activeId = useSelector((s) => s.Module?.activeModuleId);
  return router.query.module ?? slugFromModuleId(modules, activeId);
};

const addParam = (path, key, val) => {
  if (val == null || val === "") return path;
  if (new RegExp(`[?&]${key}=`).test(path)) return path; // already present, keep it
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}${key}=${val}`;
};

const injectParams = (url, lang, moduleSlug) => {
  if (url == null) return url;
  if (typeof url === "string") {
    let [path, hash] = url.split("#");
    path = addParam(path, "lang", lang);
    path = addParam(path, "module", moduleSlug);
    return `${path}${hash ? `#${hash}` : ""}`;
  }
  if (typeof url === "object") {
    return {
      ...url,
      query: {
        ...(url.query || {}),
        ...(lang ? { lang } : {}),
        ...(moduleSlug != null ? { module: moduleSlug } : {}),
      },
    };
  }
  return url;
};

export const LocalizedLink = ({ href, ...props }) => {
  const lang = useLang();
  const moduleSlug = useModuleSlug();
  return <NextLink href={injectParams(href, lang, moduleSlug)} {...props} />;
};

export const useLocalizedRouter = () => {
  const router = useNextRouter();
  const lang = useLang();
  const moduleSlug = useModuleSlug();
  return {
    ...router,
    push: (url, as, options) =>
      router.push(injectParams(url, lang, moduleSlug), as, options),
    replace: (url, as, options) =>
      router.replace(injectParams(url, lang, moduleSlug), as, options),
  };
};