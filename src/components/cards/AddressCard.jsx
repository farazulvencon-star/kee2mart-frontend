import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedAddresForEdit,
  setSelectedAddress,
} from "@/redux/slices/addressSlice";
import { setAddress } from "@/redux/slices/checkoutSlice";
import * as api from "@/api/apiRoutes";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { FaRegEdit } from "react-icons/fa";
import { RiDeleteBinLine } from "react-icons/ri";
import { t } from "@/utils/translation";
import { BsThreeDotsVertical } from "react-icons/bs";
import { isRtl } from "@/lib/utils";

const AddressCard = ({
  address,
  setShowAddAddres,
  setIsAddressSelected,
  fetchAddress,
  finalOrderAddress,
  fromAddress,
}) => {
  const dispatch = useDispatch();
  const rtl = isRtl();

  const checkout = useSelector((state) => state.Checkout);
  const selectedAddress = useSelector(
    (state) => state.Addresses.selectedAddress,
  );
  const theme = useSelector((state) => state.Theme.theme);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null); // Track selected address ID

  const formattedAddress = `${address?.address}, ${address?.landmark}, ${address?.area}, ${address?.city}, ${address?.state}, ${address?.pincode}-${address?.country}`;

  const handleDeleteAdress = async () => {
    try {
      const response = await api.deleteAddress({ id: address.id });
      if (response.status === 1) {
        fetchAddress();
        dispatch(setSelectedAddresForEdit({ data: null }));
        setShowDeleteModal(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleEditAddress = () => {
    setShowAddAddres(true);
    setIsAddressSelected(true);
    dispatch(setSelectedAddresForEdit({ data: address }));
  };

  const handleCheckboxChange = () => {
    dispatch(setAddress({ data: address }));
  };

  return (
    <div>
      <div className="py-6 px-4 w-full border-b ">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-lg">
            {t("delivery_to")}:{" "}
            <span className="font-bold">{address?.name}</span>
          </h2>
          {!fromAddress && (
            <div className="flex items-center">
              {!finalOrderAddress && (
                <input
                  type="checkbox"
                  id={`default-address-${address.id}`}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={checkout?.address?.id === address?.id}
                  onChange={handleCheckboxChange}
                />
              )}

              <label
                htmlFor={`default-address-${address.id}`}
                className={`text-sm ${rtl ? "mr-2" : "ml-2"}`}
              >
                {address?.type}
              </label>
            </div>
          )}
        </div>
        {address?.is_default === 1 && !finalOrderAddress && (
          <p className="text-sm mb-2 SecondaryTextColor">
            {t("default_address_msg")}
          </p>
        )}

        <p className="text-sm mb-4 font-semibold">{formattedAddress}</p>
        <div className="flex items-center justify-between p-2 buttonBackground rounded-sm">
          <p className="text-base font-medium">
            {t("phone")}: <span className="font-medium">{address?.mobile}</span>
          </p>
          {!finalOrderAddress && (
            <div className="md:flex md:space-x-1 flex-col md:flex-row hidden">
              <button
                className="flex items-center gap-1 textColor text-base font-medium"
                onClick={handleEditAddress}
              >
                <FaRegEdit size={18} />
                {t("edit")}
              </button>
              <span className="p-1 border-r-2 hidden md:block"></span>
              <button
                className="flex items-center text-base textColor font-medium gap-1"
                onClick={() => setShowDeleteModal(true)}
              >
                <RiDeleteBinLine size={18} />
                {t("delete")}
              </button>
            </div>
          )}
          {/* Three Dots Button and Action Popup */}
          {!finalOrderAddress && (
            <div className="flex md:hidden items-center relative">
              <button
                onClick={() => setShowActionModal(!showActionModal)}
                className="p-1"
              >
                <BsThreeDotsVertical />
              </button>

              {/* Action Popup Menu */}
              {showActionModal && (
                <>
                  {/* Invisible backdrop to close the menu when clicking outside */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowActionModal(false)}
                  ></div>

                  <div className="absolute right-0 top-8 w-32 bg-white border rounded shadow-lg z-20 overflow-hidden cardBorder buttonBackground">
                    <div className="flex flex-col gap-2  ml-4">
                      <button
                        className="flex items-center gap-1 p-1 textColor text-base font-medium"
                        onClick={() => {
                          handleEditAddress();
                          setShowActionModal(false);
                        }}
                      >
                        <FaRegEdit size={16} />
                        {t("edit")}
                      </button>
                      <button
                        className="flex items-center p-1 text-base textColor font-medium gap-1"
                        onClick={() => {
                          setShowDeleteModal(true);
                          setShowActionModal(false);
                        }}
                      >
                        <RiDeleteBinLine size={18} />
                        {t("delete")}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <Dialog open={showDeleteModal}>
        <DialogOverlay
          className={`${theme === "light" ? "bg-white/80" : "bg-black/80"}`}
        />
        <DialogContent>
          <div>
            <h1 className="font-bold">{t("delete_address")}</h1>
            <h1 className="font-bold">{t("delete_address_message")}</h1>
            <div className="flex gap-2 mt-3">
              <button
                className="px-4 py-1 bg-green-700 text-white font-bold rounded-sm"
                onClick={handleDeleteAdress}
              >
                {t("Ok")}
              </button>
              <button
                className="px-4 py-1 bg-red-700 text-white font-bold rounded-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                {t("cancel")}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AddressCard;
