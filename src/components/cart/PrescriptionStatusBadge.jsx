import React from "react";
import { useSelector } from "react-redux";
import { findGroupForVariant } from "@/utils/prescriptionGroups";
import { t } from "@/utils/translation";

// Small status pill for a cart line:
//  - grouped                       -> "Prescription added · Group N"
//  - needs prescription, ungrouped -> "Needs Prescription"
//  - otherwise           -> nothing
// All tags use the theme primary color (primaryBackColor) for the background.
const PrescriptionStatusBadge = ({ product, className = "" }) => {
  const groups = useSelector((state) => state.Checkout.prescriptionGroups);
  const grouped = findGroupForVariant(groups, product?.product_variant_id);

  if (grouped) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap text-white primaryBackColor ${className}`}
      >
        {t("rx_added")} · {t("group")} {grouped.index + 1}
      </span>
    );
  }

  if (product?.require_prescription == 1) {
    return (
      <span
        className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap text-white primaryBackColor ${className}`}
      >
        {t("needs_rx")}
      </span>
    );
  }

  return null;
};

export default PrescriptionStatusBadge;
