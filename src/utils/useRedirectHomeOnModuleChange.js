import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useLocalizedRouter } from "@/utils/localizedNav";
import { slugFromModuleId } from "@/utils/moduleSlug";

/**
 * For module-dependent single-entity pages (product detail, category detail):
 * a specific item can't exist in another module, so when the USER switches the
 * module, send them to the new module's home.
 *
 * IMPORTANT: it must NOT redirect when the module changes because a SHARED link
 * was opened (the Layout reader adopts the URL's `module` slug). We tell the two
 * apart by comparing the new module's slug with the URL's `module`:
 *   - active slug === url module  → came from the link → keep the page.
 *   - active slug !== url module  → user toggled it    → go home.
 */
export const useRedirectHomeOnModuleChange = () => {
  const activeModuleId = useSelector((state) => state.Module.activeModuleId);
  const modules = useSelector((state) => state.Module.modules);
  const router = useLocalizedRouter();
  const prevModuleRef = useRef(activeModuleId);

  useEffect(() => {
    const prev = prevModuleRef.current;
    prevModuleRef.current = activeModuleId;

    if (prev == null || prev === activeModuleId) return;

    // Module change driven by the URL (shared link) → don't redirect.
    if (slugFromModuleId(modules, activeModuleId) === router.query.module) return;

    // User-initiated module switch → this entity isn't in the new module.
    router.push("/");
  }, [activeModuleId]);
};