import React from "react";
import { MdOutlineDescription } from "react-icons/md";
import { t } from "@/utils/translation";

// Shared empty state for the static info/policy pages (Terms, Privacy, Shipping,
// Return, Cancellation, About, Contact, FAQs) when the API returns no content.
// `title` is the page name; `message` is an optional override.
const NoInfoData = ({ title, message }) => (
  <div className="container my-5 px-1 md:px-0">
    <div className="flex flex-col items-center justify-center text-center gap-3 py-16 px-6 rounded backgroundColor">
      <MdOutlineDescription size={64} className="text-gray-400" />
      {title && <h2 className="font-bold text-xl">{title}</h2>}
      <p className="text-sm text-gray-500">{message || t("no_data_found")}</p>
    </div>
  </div>
);

export default NoInfoData;
