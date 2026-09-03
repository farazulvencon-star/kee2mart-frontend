// Map between a module's id and its slug.
//   - id   → used internally (the X-Module-Id API header, guest-cart item data)
//   - slug → used in the URL (?module=grocery) for readable/SEO-friendly links
// Both helpers need the modules list from redux (state.Module.modules), which
// carries { id, slug } for each module.

export const slugFromModuleId = (modules, id) => {
  if (id == null) return undefined;
  return (modules || []).find((m) => String(m?.id) === String(id))?.slug;
};

export const moduleIdFromSlug = (modules, slug) => {
  if (!slug) return undefined;
  return (modules || []).find((m) => m?.slug === slug)?.id;
};
