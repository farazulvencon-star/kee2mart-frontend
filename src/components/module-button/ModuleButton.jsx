import React from "react";

/**
 * ModuleButton — toggle pill for app modules (e.g. Groceries / Pharmacy).
 *
 * Props:
 *  - label    : button text
 *  - icon     : React node (svg/icon). Use fill="currentColor" so color follows state.
 *  - isActive : active state styling
 *  - onClick  : click handler
 */
const ModuleButton = ({ label, icon, isActive = false, onClick, className = "" }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group px-3 py-2 rounded-xl inline-flex justify-center items-center gap-2 transition-colors cursor-pointer ${
        isActive
          ? "primaryBackColor text-white"
          : "iconBackgroundColor textcolor hover:bg-[var(--primary-color)] hover:text-white"
      } ${className}`}
    >
      <span
        className={`size-8 relative flex items-center justify-center ${
          isActive ? "text-white" : "text-green-400 group-hover:text-white"
        }`}
      >
        {/* SVG icons follow the text color (white on active/hover via fill-current).
            <img> icons are left as-is — no inversion to white. */}
        <span className="size-6 flex items-center justify-center [&_svg]:size-6 [&_svg]:fill-current [&_svg_*]:fill-current">
          {icon}
        </span>
      </span>
      <span className="text-base font-bold leading-5">{label}</span>
    </button>
  );
};

export default ModuleButton;