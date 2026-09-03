import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { LocalizedLink } from "@/utils/localizedNav";
import { RiCloseFill } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { setIsPopupSeen } from "@/redux/slices/settingSlice";
import { useLocalizedRouter } from "@/utils/localizedNav";

import {
  setFilterCategory,
  setSelectedCategories,
  setListingSource,
  setCategorySlug,
  setCategoryBreadcrumb,
} from "@/redux/slices/productFilterSlice";

const HomeOfferModal = () => {
  const dispatch = useDispatch();
  const setting = useSelector((state) => state.Setting);
  const city = useSelector((state) => state.City);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useLocalizedRouter();

  useEffect(() => {
    if (setting?.setting?.popup_enabled === "1" && city?.city !== null) {
      if (setting?.setting?.popup_always_show_home === "1") {
        // Always show the modal on every home page visit
        setIsModalOpen(true);
      } else if (setting?.setting?.popup_always_show_home === "0") {
        // Show the modal only once
        const hasPopupBeenSeen = setting?.isPopupSeen;
        if (!hasPopupBeenSeen) {
          setIsModalOpen(true);
        }
      }
    }
  }, [
    setting?.setting?.popup_enabled,
    setting?.setting?.popup_always_show_home,
    city?.city,
  ]);

  const handleClose = () => {
    setIsModalOpen(false);
    dispatch(setIsPopupSeen({ data: true }));
  };

  const categoryBreadcrumb = useSelector(
    (state) => state.ProductFilter.categoryBreadcrumb,
  );

  const slug = setting?.setting?.popup_slug;
  const category_id = setting?.setting?.popup_type_id;
  const type = setting?.setting?.popup_type;
  const url = setting?.setting?.popup_url;


  const getHref = () => {
    if (type === "product" && slug) return `/product/${slug}`;
    if (type === "popup_url" && url) return url;
    return "#"; 
  };

  const handlePopupClick = (e) => {
    // 2. Handle the "Category" logic separately
    if (type === "category" && slug) {
      e.preventDefault(); // Stop the <LocalizedLink> from navigating to "#"
      handleClose();
      // Category browsing now lives on the SEO-friendly /categories/<slug> page.
      router.push(`/categories/${slug}`);
    } else {
      // For products and external URLs, just close the modal and let <LocalizedLink> do its job
      handleClose();
    }
  };

  return (
    <div>
      <Dialog open={isModalOpen} className="focus-visible:outline-none">
        <DialogContent
          className="bg-transparent border-none shadow-none focus-visible:outline-none focus-within:border-none"
          onInteractOutside={(e) => e.preventDefault()}
          aria-describedby={undefined}
        >
          <DialogHeader>
            <DialogTitle>
              <div className="flex justify-end">
                <RiCloseFill
                  className="w-12 h-12 textColor closeButtonBg rounded-full p-[8px]  cursor-pointer"
                  onClick={handleClose}
                />
              </div>
            </DialogTitle>
          </DialogHeader>
          <div className="bg-transparent">
            <div className="h-full w-full ">
              <LocalizedLink
                href={getHref()}
                target={type === "popup_url" ? "_blank" : "_self"}
                onClick={handlePopupClick}
                 className="block outline-none"
              >
                <Image
                  src={setting?.setting?.popup_image}
                  alt="Offer image"
                  height={1000}
                  width={1000}
                  className="h-full w-full object-contain focus-visible:outline-none"
                />
              </LocalizedLink>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomeOfferModal;
