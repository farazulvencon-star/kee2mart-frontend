import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { t } from "@/utils/translation";
import { IoIosCloseCircle } from "react-icons/io";
import { RiCloseFill } from "react-icons/ri";
import * as api from "@/api/apiRoutes";
import { toast } from "react-toastify";
import Image from "next/image";


const RequestedProductModal = ({ showModal, setShowModal, setFlag }) => {
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.setProductRequest({ description, image });
      if (response.status == 1) {
        setShowModal(false);
        setDescription("");
        removeImage();
        setLoading(false);
        setFlag((prev) => !prev);
        toast.success(response.message);
      } else {
        toast.error(response.message);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.log("error", error);
    }
  };

  return (
    <Dialog open={showModal}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="flex justify-between items-center flex-row">
          <h1 className="font-bold text-xl">{t("requestProduct")}</h1>
          <div className="closeButtonBg rounded-full p-[8px] gap-[4px] cursor-pointer">
            <RiCloseFill
              size={22}
              className="cursor-pointer hover:text-gray-500 transition "
              onClick={() => setShowModal(false)}
            />
          </div>
        </DialogHeader>

        <div className="mt-4">
          {/* Description */}
          <div className="mb-4">
            <label
              htmlFor="description"
              className="block text-base font-medium"
            >
              {t("productDescription")}
            </label>
            <textarea
              id="description"
              name="description"
              placeholder={t('enter_product_desription')}
              className="mt-1 block w-full rounded-sm cardBorder p-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-base font-medium mb-2">
              {t("productImage")}
            </label>

            {!preview ? (
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm file:mr-4 file:py-2 file:px-4 
                           file:border-0 file:text-sm file:font-semibold 
                           file:bg-primaryBackColor hover:file:bg-primaryBackColorHover"
              />
            ) : (
              <div className="relative inline-block mt-2">
                <Image
                  src={preview}
                  alt="Preview"
                  width={160}
                  height={160}
                  className="w-40 h-40 object-cover rounded-md border"
                />
                <button
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 bg-white rounded-full shadow hover:bg-gray-100 transition"
                >
                  <IoIosCloseCircle size={24} className="text-red-500" />
                </button>
              </div>
            )}
          </div>
          <div className="mt-6 flex justify-end w-full">
            <button
              type="button"
              className="w-40 bg-[#29363f]  text-white py-2 px-4 rounded-md "
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? t("loading") : t("submitRequest")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RequestedProductModal;
