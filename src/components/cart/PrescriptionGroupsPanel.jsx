import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RiCloseFill } from "react-icons/ri";
import { FiChevronDown } from "react-icons/fi";
import { toast } from "react-toastify";
import { t } from "@/utils/translation";

// Max prescription images allowed per group.
const MAX_IMAGES_PER_GROUP = 5;
import {
  addPrescriptionGroup,
  removePrescriptionGroup,
  addImagesToGroup,
  removeImageFromGroup,
  selectPrescriptionProducts,
  clearPrescriptionSelection,
} from "@/redux/slices/checkoutSlice";
import { getUncoveredRequiredVariantIds } from "@/utils/prescriptionGroups";

// Grouping panel: pick products via the card checkboxes, then attach one
// prescription per group. Supports multiple groups. `compact` tightens spacing
// for the cart drawer, where the body is collapsible and the group list scrolls
// internally so it never squeezes the product list.
const PrescriptionGroupsPanel = ({ cartProductsData, compact = false }) => {
  const dispatch = useDispatch();
  const groups = useSelector((state) => state.Checkout.prescriptionGroups);
  const selected = useSelector(
    (state) => state.Checkout.selectedPrescriptionProductIds
  );
  // Prescription upload requires login (image files can't be persisted for
  // guests). Guests see a "login to upload" prompt; they log in at checkout.
  const isLoggedIn = useSelector((state) => !!state.User?.jwtToken);

  const [collapsed, setCollapsed] = useState(false);
  const attachInputRef = useRef(null);
  const addInputRefs = useRef({});

  const nameOf = (variantId) =>
    cartProductsData?.find((p) => p?.product_variant_id == variantId)?.product
      ?.translations?.name || `#${variantId}`;

  const requiredCount = (cartProductsData || []).filter(
    (p) => p?.require_prescription == 1
  ).length;
  const uncovered = getUncoveredRequiredVariantIds(cartProductsData, groups);
  const coveredRequired = requiredCount - uncovered.length;
  const allCovered = requiredCount > 0 && uncovered.length === 0;

  // In the drawer the body can be collapsed for room, but force it open while
  // the user has a pending selection so the Attach button stays reachable.
  const bodyOpen = !compact || !collapsed || selected?.length > 0;

  // Build image objects from the given files (object URLs only for kept files).
  const toImages = (files) =>
    files.map((file) => ({ file, preview: URL.createObjectURL(file) }));

  const handleAttach = (e) => {
    let files = Array.from(e.target.files || []);
    if (files.length > MAX_IMAGES_PER_GROUP) {
      files = files.slice(0, MAX_IMAGES_PER_GROUP);
      toast.error(t("max_prescription_images"));
    }
    const images = toImages(files);
    if (images.length) dispatch(addPrescriptionGroup({ images }));
    e.target.value = "";
  };

  const handleAddImages = (id, e) => {
    let files = Array.from(e.target.files || []);
    e.target.value = "";
    const group = groups.find((g) => g.id === id);
    const remaining = MAX_IMAGES_PER_GROUP - (group?.images?.length || 0);
    if (remaining <= 0) {
      toast.error(t("max_prescription_images"));
      return;
    }
    if (files.length > remaining) {
      files = files.slice(0, remaining);
      toast.error(t("max_prescription_images"));
    }
    const images = toImages(files);
    if (images.length) dispatch(addImagesToGroup({ id, images }));
  };

  const handleSelectAllRequired = () => {
    if (uncovered.length) {
      dispatch(selectPrescriptionProducts({ productIds: uncovered }));
    }
  };

  const thumb = compact ? "w-11 h-11" : "w-16 h-16";

  // Small coverage chip used in the collapsible header.
  const coverageChip = requiredCount > 0 && (
    <span
      className="text-[11px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={
        allCovered
          ? { background: "#dcfce7", color: "#166534" }
          : { background: "#fef3c7", color: "#92400e" }
      }
    >
      {allCovered ? "✓ " : "⚠ "}
      {coveredRequired}/{requiredCount}
    </span>
  );

  return (
    <div
      className={`${
        compact ? "mb-3 pb-3 border-b" : "mb-4 p-4 cardBorder rounded-md"
      }`}
    >
      {/* Header (collapsible in the drawer) */}
      <button
        type="button"
        disabled={!compact}
        onClick={() => compact && setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between gap-2 mb-2 text-left"
      >
        <span className={`${compact ? "text-sm" : "text-base"} font-bold`}>
          {t("upload_prescription")}
          {requiredCount > 0 && <span className="text-red-500"> *</span>}
        </span>
        <span className="flex items-center gap-2">
          {compact && coverageChip}
          {groups?.length > 0 && (
            <span className="text-[11px] text-gray-500 whitespace-nowrap">
              {groups.length} {groups.length > 1 ? t("groups") : t("group")}
            </span>
          )}
          {compact && (
            <FiChevronDown
              size={18}
              className={`transition-transform ${
                bodyOpen ? "rotate-180" : ""
              }`}
            />
          )}
        </span>
      </button>

      {bodyOpen &&
        (!isLoggedIn ? (
          // Guests can't upload prescription images (not persistable) — prompt login.
          <p className="text-[11px] text-gray-500 mt-1">
            {t("login_to_upload_prescription")}
          </p>
        ) : (
          <>
          {/* Coverage banner (full width, with hint) */}
          {requiredCount > 0 && (
            <div
              className="text-xs font-semibold rounded px-2 py-1 mb-2"
              style={
                allCovered
                  ? { background: "#dcfce7", color: "#166534" }
                  : { background: "#fef3c7", color: "#92400e" }
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span>
                  {allCovered ? "✓ " : "⚠ "}
                  {coveredRequired}/{requiredCount}{" "}
                  {t("prescription_products_covered")}
                </span>
                {uncovered.length > 0 && (
                  <button
                    type="button"
                    className="underline font-medium whitespace-nowrap"
                    onClick={handleSelectAllRequired}
                  >
                    {t("select_all_rx")}
                  </button>
                )}
              </div>
              {uncovered.length > 0 && selected?.length > 0 && (
                <span className="block font-normal mt-0.5">
                  {t("tap_attach_to_cover")}
                </span>
              )}
            </div>
          )}

          {/* Existing groups — height-capped scroll area so it never grows
              unbounded and pushes the product list out of view. */}
          {groups?.length > 0 && (
            <div
              className={
                compact ? "max-h-[168px] overflow-y-auto pr-1 -mr-1" : ""
              }
            >
              {groups.map((g, idx) => {
                return (
                  <div
                    key={g.id}
                    className="rounded-md border p-2 mb-2"
                    style={{ borderLeft: "4px solid var(--primary-color)" }}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap text-white primaryBackColor">
                        {t("group")} {idx + 1}
                      </span>
                      <button
                        type="button"
                        className="text-[11px] font-medium"
                        onClick={() =>
                          dispatch(removePrescriptionGroup({ id: g.id }))
                        }
                      >
                        {t("delete")}
                      </button>
                    </div>
                    {/* Thumbnails in a single horizontally-scrolling row */}
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {g.images?.map((img, i) => (
                        <div key={i} className={`relative flex-shrink-0 ${thumb}`}>
                          <img
                            src={img.preview}
                            alt="prescription"
                            className="w-full h-full object-cover rounded-md border"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              dispatch(
                                removeImageFromGroup({ id: g.id, index: i })
                              )
                            }
                            className="absolute -top-1.5 -right-1.5 bg-white rounded-full shadow p-0.5"
                          >
                            <RiCloseFill size={12} />
                          </button>
                        </div>
                      ))}
                      {(g.images?.length || 0) < MAX_IMAGES_PER_GROUP && (
                        <label
                          className={`flex-shrink-0 flex items-center justify-center ${thumb} border border-dashed primaryColorBorder primaryColor rounded-md cursor-pointer text-xl leading-none`}
                        >
                          <input
                            ref={(el) => (addInputRefs.current[g.id] = el)}
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={(e) => handleAddImages(g.id, e)}
                          />
                          +
                        </label>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-500 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>
                        {t("covers")} {g.productIds.length}:
                      </span>
                      {g.productIds.map((id) => (
                        <span key={id} className="whitespace-nowrap">
                          • {nameOf(id)}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Selection / attach bar */}
          {selected?.length > 0 ? (
            <div
              className="rounded-md p-2 text-xs mt-1"
              style={{ border: "1px dashed var(--primary-color)" }}
            >
              <p className="mb-2 truncate ">
                <b>{selected.length}</b> {t("selected")}:{" "}
                {selected.map(nameOf).join(", ")}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 py-1.5 primaryBackColor text-white rounded font-bold"
                  onClick={() => attachInputRef.current?.click()}
                >
                {t("attach_prescription")}
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 border rounded primaryBackColor text-white"
                  onClick={() => dispatch(clearPrescriptionSelection())}
                >
                  {t("clear")}
                </button>
              </div>
              <input
                ref={attachInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleAttach}
              />
            </div>
          ) : (
            !allCovered && (
              <p className="text-[11px] text-gray-500 mt-1">
                {t("select_products_to_attach_prescription")}
              </p>
            )
          )}
          </>
        ))}
    </div>
  );
};

export default PrescriptionGroupsPanel;
