import React from "react";
import { t } from "@/utils/translation";

// Rebuild prescription groups from the order items: items that share the same
// prescription image(s) were uploaded together as one group at checkout.
// Returns [{ images: [url...], products: [name...] }].
const buildGroups = (items) => {
  const map = new Map();
  (items || []).forEach((item) => {
    const urls = item?.prescriptions || [];
    if (!urls.length) return;
    const key = [...urls].sort().join("|");
    if (!map.has(key)) map.set(key, { images: urls, products: [] });
    const name = item?.name || `#${item?.product_variant_id}`;
    if (!map.get(key).products.includes(name)) {
      map.get(key).products.push(name);
    }
  });
  return [...map.values()];
};

const OrderPrescriptions = ({ orderDetail }) => {
  const groups = buildGroups(orderDetail?.items);
  if (!groups.length) return null;

  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-bold text-2xl">{t("prescriptions")}</h1>
      <div className="cardBorder rounded-sm p-4 flex flex-col gap-4">
        {groups.map((group, idx) => (
          <div
            key={idx}
            className="rounded-md border p-3"
            style={{ borderLeft: "4px solid var(--primary-color)" }}
          >
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap text-white primaryBackColor">
                {t("group")} {idx + 1}
              </span>
              <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span>
                  {t("covers")} {group.products.length}:
                </span>
                {group.products.map((name, i) => (
                  <span key={i} className="whitespace-nowrap">
                    • {name}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {group.images.map((url, i) => (
                <a
                  key={i}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-20 h-20 rounded-md border overflow-hidden hover:opacity-90 transition"
                  title={t("view")}
                >
                  <img
                    src={url}
                    alt="prescription"
                    className="w-full h-full object-cover"
                  />
                </a>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderPrescriptions;
