import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { store } from "@/redux/store";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// True when an HTML string has no meaningful content — covers null/undefined,
// empty strings, and markup like "<p></p>", "<br>", "&nbsp;" or whitespace only.
export function isEmptyHtml(html) {
  if (!html) return true;
  const text = String(html)
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, "")
    .replace(/\s/g, "");
  return text.length === 0;
}

export function formatCustomDate(dateString) {
  if (!dateString) return;

  const isoCompatibleString = dateString.replace(/Z+$/, "Z");
  // NOTE: for removing the zz from created At which return Nan
  // const isoCompatibleString = dateString.replace(" ", "T") + "Z";
  const date = new Date(isoCompatibleString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  const isPM = hours >= 12;
  const formattedHours = String(hours % 12 || 12).padStart(2, "0");
  const ampm = isPM ? "PM" : "AM";

  return `${day}-${month}-${year}, ${formattedHours}:${minutes}:${seconds} ${ampm}`;
}

export const formatOnlyDate = (dateString) => {
  if (!dateString) return;

  const isoCompatibleString = dateString.replace(/Z+$/, "Z");
  // NOTE: for removing the zz from created At which return Nan
  // const isoCompatibleString = dateString.replace(" ", "T") + "Z";
  const date = new Date(isoCompatibleString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Whole-number prices (34) get ".00" appended; prices that already carry
// decimals from the API (23.80, 34.890) are left as-is.
export const formatPriceDisplay = (amount) => {
  const num = Number(amount);
  if (amount == null || Number.isNaN(num)) return amount;
  return Number.isInteger(num) ? num.toFixed(2) : amount;
};

// Splits [minPrice, maxPrice] into ~4 "nice number" buckets (steps of 1/2/5/10
// x a power of 10) so a price filter can show round ranges like 100-300,
// 300-500 instead of arbitrary decimals. Last bucket may be narrower than the
// rest since it's clipped to maxPrice.
export const buildPriceRanges = (minPrice, maxPrice) => {
  if (maxPrice <= minPrice) return [];

  const rawStep = (maxPrice - minPrice) / 4;
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const normalized = rawStep / magnitude;
  const niceSteps = [1, 2, 5, 10];

  let factor = niceSteps[0];
  for (const value of niceSteps) {
    if (Math.abs(normalized - value) < Math.abs(normalized - factor)) {
      factor = value;
    }
  }

  const step = factor * magnitude;
  const ranges = [];
  let start = minPrice;
  while (start < maxPrice) {
    const end = Math.min(start + step, maxPrice);
    ranges.push({ start, end });
    start = end;
  }
  return ranges;
};

export const isRtl = () => {
  const state = store.getState();
  const isLangRtl =
    state?.Language?.selectedLanguage?.type == "RTL" ? true : false;
  return isLangRtl;
};

/**
 * Resolve a card's background color (category / brand / country).
 * Mode-agnostic: prefer the item's own color (item-wise), else fall back to the
 * root/global color. Works for both the shop API (with mode) and the listing
 * APIs (no mode field). `mode` is accepted but optional/ignored.
 * Returns null when transparent/empty so the card keeps its default bg.
 */
export const resolveCardBg = ({ item, globalLight, globalDark, isDark }) => {
  const isEmpty = (c) => !c || c === "#00000000" || c === "transparent";
  let color = isDark
    ? item?.background_color_for_dark_theme
    : item?.background_color_for_light_theme;
  if (isEmpty(color)) color = isDark ? globalDark : globalLight;
  if (isEmpty(color)) return null;
  return color;
};
