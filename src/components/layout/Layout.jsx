import React, { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { setPaymentSetting, setSetting } from "@/redux/slices/settingSlice";
import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import * as api from "@/api/apiRoutes";
import { ToastContainer } from "react-toastify";
import Loader from "../loader/Loader";
import { setFavoriteProductIds } from "@/redux/slices/FavoriteSlice";
import PushNotification from "../firebasenotification/PushNotification";
import LangFile from "@/utils/en.json";
import {
  setAvailableLanguages,
  setSelectedLanguage,
} from "@/redux/slices/languageSlice";
import { useRouter } from "next/router";
import MaintanceMode from "../error/MaintanceMode";
import { setActiveModule } from "@/redux/slices/moduleSlice";
import { moduleIdFromSlug, slugFromModuleId } from "@/utils/moduleSlug";

const Layout = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.Theme.theme);
  const setting = useSelector((state) => state.Setting);
  const language = useSelector((state) => state.Language.selectedLanguage);
  const activeModuleId = useSelector((state) => state.Module.activeModuleId);
  const modules = useSelector((state) => state.Module.modules);
  // The URL's ?module (slug) wins on load; these refs keep the reader/writer from
  // fighting each other (rehydration vs the URL) on the first render pass.
  const didInitModuleFromUrl = useRef(false);
  const moduleWriterRan = useRef(false);

  // ── Module ↔ URL sync (works for every page, shareable across modules) ──
  // Reader: resolve the active module ONCE on load, honoring ONLY the modules
  // the API actually returns (i.e. the ENABLED ones). The API list is the
  // whitelist, so this self-adjusts to any admin on/off combination. Priority:
  //   1. a valid ?module=<slug>            (shared link / edited URL)
  //   2. a valid legacy ?module_id=<id>    (old links — backward compat)
  //   3. the persisted active module, if it's still enabled
  //   4. otherwise the first enabled module (default)
  // This guarantees activeModuleId is always an enabled module, so editing the
  // URL to a disabled/unknown module can never reach that module's data.
  // (The writer below then reflects the resolved module's slug in the URL.)
  useEffect(() => {
    if (!router.isReady || didInitModuleFromUrl.current) return;
    if (!modules?.length) return; // enabled-modules list not loaded yet — wait

    didInitModuleFromUrl.current = true;

    const isEnabled = (id) =>
      id != null && modules.some((m) => String(m?.id) === String(id));

    const urlSlug = router.query.module;
    const legacyId = router.query.module_id;

    let targetId = null;
    if (urlSlug != null) targetId = moduleIdFromSlug(modules, urlSlug); // valid slug only
    else if (isEnabled(legacyId)) targetId = Number(legacyId);

    if (targetId == null) {
      targetId = isEnabled(activeModuleId) ? activeModuleId : modules[0].id;
    }

    if (String(targetId) !== String(activeModuleId)) {
      dispatch(setActiveModule({ data: targetId }));
    }
  }, [router.isReady, router.query.module, router.query.module_id, activeModuleId, modules]);

  // Writer: keep the active module's slug in the URL, and strip any legacy
  // ?module_id so only ?module=<slug> remains. Category/product pages handle
  // their own module-switch redirect, so skip them here.
  useEffect(() => {
    if (!router.isReady || activeModuleId == null) return;
    const activeSlug = slugFromModuleId(modules, activeModuleId);
    if (!activeSlug) return; // modules not loaded yet — can't write the slug
    const hasLegacyId = router.query.module_id != null;
    // On the first run, if the URL already carries a module slug, let the reader
    // adopt it — unless there's also a legacy module_id we still need to strip.
    if (!moduleWriterRan.current) {
      moduleWriterRan.current = true;
      if (router.query.module != null && !hasLegacyId) return;
    }
    if (
      router.pathname.startsWith("/categories") ||
      router.pathname.startsWith("/product/")
    )
      return;
    if (router.query.module === activeSlug && !hasLegacyId) return;
    const nextQuery = { ...router.query, module: activeSlug };
    delete nextQuery.module_id; // drop the legacy param
    router.replace(
      { pathname: router.pathname, query: nextQuery },
      undefined,
      { shallow: true },
    );
  }, [router.isReady, activeModuleId, modules, router.query.module_id]);

  // Guard: whenever the FRESH modules list changes (e.g. admin disabled a module
  // that was currently active), make sure the active module is still enabled.
  // If it isn't, fall back to the first enabled module — otherwise the disabled
  // module's data would keep showing even after its list entry (and toggle) are
  // gone. Runs on every modules change (not once), unlike the reader above.
  useEffect(() => {
    if (!modules?.length || activeModuleId == null) return;
    const stillEnabled = modules.some(
      (m) => String(m?.id) === String(activeModuleId)
    );
    if (!stillEnabled) {
      dispatch(setActiveModule({ data: modules[0].id }));
    }
  }, [modules, activeModuleId]);

  const availableLanguages = useSelector(
    (state) => state.Language.availableLanguages,
  );

  const [loading, setLoading] = useState(false);
  // const [showLocation, setShowLocation] = useState(false)

  useEffect(() => {
    if (!language?.type) return;
    document.documentElement.dir = language.type.toLowerCase();
    document.documentElement.lang = language.code || "en";
  }, [language?.type, language?.code]);

  useEffect(() => {
    fetchSetting();
    fetchPaymentSetting();
    if (!availableLanguages?.length) {
      fetchLanguage();
    }
  }, []);

  useEffect(() => {
    if (!router.isReady || !availableLanguages?.length) return;

    const queryLang = router.query.lang;

    // If no lang in URL → do nothing (your other effect handles it)
    if (!queryLang) return;

    const targetLang = availableLanguages.find((l) => l.code === queryLang);

    // ✅ If valid language → existing behavior (unchanged)
    if (targetLang) {
      if (targetLang.code === language?.code) return;

      api
        .getSystemLanguages({
          id: targetLang.id,
          isDefault: 0,
          systemType: 3,
        })
        .then((res) => {
          if (res.status == 1 && res.data?.code !== language?.code) {
            dispatch(setSelectedLanguage({ data: res.data }));
          }
        })
        .catch((err) => console.log("lang sync error", err));

      return;
    }

    // ✅ ✅ FALLBACK LOGIC (NO API CALL)
    const fallbackLang =
      availableLanguages.find((l) => l.is_default == 1) ||
      availableLanguages.find((l) => l.code === "en") ||
      availableLanguages[0];

    if (!fallbackLang) return;

    // If already same → just fix URL
    if (fallbackLang.code === language?.code) {
      router.replace(
        {
          pathname: router.pathname,
          query: { ...router.query, lang: fallbackLang.code },
        },
        undefined,
        { shallow: true },
      );
      return;
    }

    // ✅ Set fallback WITHOUT API
    dispatch(setSelectedLanguage({ data: fallbackLang }));

    // ✅ Fix URL
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, lang: fallbackLang.code },
      },
      undefined,
      { shallow: true },
    );
  }, [router.query.lang, router.isReady, availableLanguages]);

  const fetchLanguage = async () => {
    try {
      const response = await api.getSystemLanguages({
        id: 0,
        isDefault: 0,
        systemType: 3,
      });
      if (response.status == 1) {
        if (response.data !== undefined) {
          if (response?.data?.length == 1) {
            try {
              const langRes = await api.getSystemLanguages({
                id: response?.data?.[0]?.id,
                isDefault: 1,
                systemType: 3,
              });
              if (langRes.status == 1) {
                dispatch(setSelectedLanguage({ data: langRes?.data }));
              } else {
                const language = {
                  id: 15,
                  name: "English",
                  code: "en",
                  type: "LTR",
                  system_type: 3,
                  is_default: 1,
                  json_data: LangFile,
                  display_name: "English",
                  system_type_name: "Website",
                };
                dispatch(setSelectedLanguage({ data: language }));
              }
            } catch (error) {
              console.log("error");
            }
          } else if (language == null) {
            const langId = response?.data?.find(
              (lang) => lang?.is_default == 1,
            )?.id;
            const langRes = await api.getSystemLanguages({
              id: langId,
              isDefault: 1,
              systemType: 3,
            });
            dispatch(setSelectedLanguage({ data: langRes?.data }));
          }
          dispatch(setAvailableLanguages({ data: response.data }));
        } else {
          const language = {
            id: 15,
            name: "English",
            code: "en",
            type: "LTR",
            system_type: 3,
            is_default: 1,
            json_data: LangFile,
            display_name: "English",
            system_type_name: "Website",
          };
          dispatch(setSelectedLanguage({ data: language }));
        }
      }
    } catch (error) {
      console.log("Error", error);
    }
  };
  useEffect(() => {
    if (!router.isReady) return;

    if (router.query?.lang === language?.code) return;

    // If language exists but URL doesn't have it → add it
    if (language?.code && !router.query?.lang) {
      router.replace({
        pathname: router.pathname,
        query: { ...router.query, lang: language?.code },
      });
    }
  }, [language, router.isReady]);

  const fetchSetting = async () => {
    setLoading(true);
    try {
      const res = await api.getSetting();
      const setting = JSON.parse(atob(res.data));
      dispatch(setSetting({ data: setting }));
      dispatch(setFavoriteProductIds({ data: setting?.favorite_product_ids }));
      const themeColor = setting?.web_settings?.color;
      document.documentElement.style.setProperty(
        "--primary-color",
        setting?.web_settings?.color,
      );
      if (setting?.favicon) {
        const link =
          document.querySelector("link[rel*='icon']") ||
          document.createElement("link");
        const oldLinks = document.querySelectorAll("link[rel*='icon']");
        oldLinks.forEach((el) => el.parentNode.removeChild(el));
        link.type = "image/x-icon";
        link.rel = "shortcut icon";
        link.href = setting.favicon;
        link.sizes = "16x16 32x32 64x64";
        document.getElementsByTagName("head")[0].appendChild(link);
      }
      document.documentElement.style.setProperty(
        "--light-primary-color",
        setting?.web_settings?.light_color,
      );
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log("error", error);
    }
  };

  const fetchPaymentSetting = async () => {
    setLoading(true);
    try {
      const res = await api.getPaymentSetting();
      dispatch(setPaymentSetting({ data: JSON.parse(atob(res.data)) }));
    } catch (error) {
      setLoading(false);
      console.log("error", error);
    }
  };

  useEffect(() => {
    // Show loader on route change start
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);

    // Cleanup event listeners
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <section>
      {loading ? (
        <Loader screen="full" />
      ) : setting?.setting?.web_settings?.website_mode == 1 ? (
        <MaintanceMode
          message={setting?.setting?.web_settings?.website_mode_remark}
        />
      ) : (
        <PushNotification>
          <Header />
          {children}
          <Footer />
          <ToastContainer
            theme={theme}
            key="toastContainer"
            bodyClassName={"toast-body"}
            toastClassName="toast-container-className"
          />
        </PushNotification>
      )}
      {/* <Location showLocation={showLocation} setShowLocation={setShowLocation} /> */}
    </section>
  );
};

export default Layout;