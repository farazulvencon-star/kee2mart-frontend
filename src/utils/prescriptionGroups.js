// Helpers for the cart prescription-grouping feature.
// A "prescription group" binds a set of selected cart lines (identified by
// product_variant_id) to one or more prescription images.
//
// Note: all prescription tags use the theme primary color (var(--primary-color))
// via the primaryBackColor/primaryColor classes — there is no per-group color.

// The group a given cart line (variant) belongs to, plus its index (for the
// group number label).
export const findGroupForVariant = (groups, variantId) => {
  if (!Array.isArray(groups)) return null;
  const index = groups.findIndex((g) => g?.productIds?.includes(variantId));
  return index === -1 ? null : { group: groups[index], index };
};

// Whether the prescription selection/grouping UI should be shown at all.
export const isPrescriptionContext = (cartProductsData, activeModuleId) =>
  activeModuleId == 2 ||
  (cartProductsData || []).some((p) => p?.require_prescription == 1);

// Variant ids of products that require a prescription but are not yet in a group.
export const getUncoveredRequiredVariantIds = (cartProductsData, groups) => {
  const required = (cartProductsData || [])
    .filter((p) => p?.require_prescription == 1)
    .map((p) => p?.product_variant_id);
  const covered = new Set(
    (groups || []).flatMap((g) => g?.productIds || [])
  );
  return required.filter((id) => !covered.has(id));
};
