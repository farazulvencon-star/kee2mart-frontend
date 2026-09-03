import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useSelector, useDispatch } from "react-redux";
import { t } from "@/utils/translation";
import * as api from "@/api/apiRoutes";
import { toast } from "react-toastify";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { RiCloseFill, RiCameraLine } from "react-icons/ri"; // Added camera icon
import { setAuthType, setCurrentUser } from "@/redux/slices/userSlice";
import {
  addtoGuestCart,
  setCart,
  setCartProducts,
  setCartSubTotal,
  setDoorStepDeliveryMode,
  setGuestCartTotal,
  setIsGuest,
  setSelfPickupMode,
} from "@/redux/slices/cartSlice";
import { setSetting } from "@/redux/slices/settingSlice";
import { setTokenThunk } from "@/redux/thunk/loginthunk";

const NewUserModal = ({
  showNewUser,
  setShowNewUser,
  setUserName,
  setPhoneNumberWithoutCountryCode,
  setEmail,
  userName,
  email,
  phoneNumberWithoutCountryCode,
  countryCode,
  setCountryCode,
  setIsOTP,
}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null); // Ref for hidden file input
  const authType = useSelector((state) => state.User.authType);
  const cart = useSelector((state) => state.Cart);
  const setting = useSelector((state) => state.Setting.setting);
  const city = useSelector((state) => state.City.city);

  const [loading, setLoading] = useState(false);
  const [friendCode, setFriendCode] = useState(null);

  // New states for Profile Image
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (showNewUser && authType == "google" && process.env.NEXT_PUBLIC_DEMO_MODE == "true") {
      setPhoneNumberWithoutCountryCode("");
    }
  }, [showNewUser]);

  const handleChangeUserName = (e) => setUserName(e.target.value);
  const handleChangeEmail = (e) => setEmail(e.target.value);
  const handleChangePhoneNumber = (e) => setPhoneNumberWithoutCountryCode(e.target.value);
  const handleFriendCodeChange = (e) => setFriendCode(e.target.value);

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserRegister = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      if (authType == "phone" && userName == null) {
        toast.error(t("username_required"));
        setLoading(false);
        return;
      }

      // If your API expects FormData for file uploads:
      const formData = {
        name: userName,
        email: email,
        mobile: phoneNumberWithoutCountryCode,
        country_code: countryCode,
        type: authType,
        friend_code: friendCode,
        profile: profileImage, // Added profile image here
      };

      const result = await api.registerUser(formData);

      if (result?.status == 1) {
        const tokenSet = await dispatch(setTokenThunk(result?.data?.access_token));
        await getCurrentUser();
        dispatch(setAuthType({ data: authType }));
        dispatch(setIsGuest({ data: false }));
        await handleFetchSetting();

        if (cart?.isGuest === true && cart?.guestCart?.length !== 0 && result?.data?.user?.status == 1) {
          await addToBulkCart(result?.data.access_token);
        }
        await fetchCart();
        setLoading(false);
        setShowNewUser(false);
        setIsOTP(false);
      } else {
        toast.error(t(result?.message));
        setLoading(false);
      }
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  // ... (keep handleFetchSetting, getCurrentUser, addToBulkCart, fetchCart, getProductData exactly as they are)
  const handleFetchSetting = async () => {
    try {
      const res = await api.getSetting();
      const parsedSetting = JSON.parse(atob(res.data));
      dispatch(setSetting({ data: parsedSetting }));
    } catch (error) {
      console.log("error", error);
    }
  };

  const getCurrentUser = async () => {
    try {
      const response = await api.getUser();
      dispatch(setCurrentUser({ data: response.user }));
      toast.success(t("login_success"));
    } catch (error) {
      console.log("error", error);
    }
  };

  const addToBulkCart = async () => {
    try {
      const variantIds = cart?.guestCart?.map((p) => p.product_variant_id);
      const quantities = cart?.guestCart?.map((p) => p.qty);
      const response = await api.addToBulkCart({
        variant_ids: variantIds.join(","),
        quantities: quantities.join(","),
      });
      if (response.status == 1) {
        dispatch(setGuestCartTotal({ data: 0 }));
        dispatch(addtoGuestCart({ data: [] }));
        dispatch(setCartSubTotal({ data: response.sub_total }));
      } else {
        console.log("Error while adding bulk products");
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const fetchCart = async () => {
    const latitude = city?.latitude || setting?.default_city?.latitude;
    const longitude = city?.longitude || setting?.default_city?.longitude;
    try {
      const response = await api.getCart({
        latitude: latitude,
        longitude: longitude,
      });
      if (response.status === 1) {
        dispatch(setCart({ data: response.data }));
        const productsData = getProductData(response.data);
        dispatch(setCartProducts({ data: productsData }));
        dispatch(setCartSubTotal({ data: response?.data?.sub_total }));
        dispatch(setSelfPickupMode({ data: response?.data?.self_pickup_mode }));
        dispatch(
          setDoorStepDeliveryMode({
            data: response?.data?.doorstep_delivery_mode,
          })
        );
      } else {
        dispatch(setCart({ data: null }));
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getProductData = (cartData) => {
    return cartData?.cart?.map((product) => ({
      product_id: product?.product_id,
      product_variant_id: product?.product_variant_id,
      qty: product?.qty,
    }));
  };

  return (
    <Dialog open={showNewUser}>
      <DialogContent className="">
        <DialogHeader className="flex flex-row justify-between items-center">
          <div className="">
            <h1 className="text-3xl font-bold">{t("register")}</h1>
          </div>
          <div className="closeButtonBg rounded-full p-[8px] gap-[4px] cursor-pointer">
            <RiCloseFill size={22} onClick={() => setShowNewUser(false)} />
          </div>
        </DialogHeader>
        <div>
          <p className="text-xs text-center mb-2">
            {t("update_your_profile_note")}
          </p>

          {/* Profile Image Upload Section */}
          <div className="flex flex-col items-center mb-4">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden cardBorder cursor-pointer flex items-center justify-center bg-gray-50"
              onClick={() => fileInputRef.current.click()}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <RiCameraLine size={30} className="text-gray-400" />
              )}
              <div className="absolute bottom-0 w-full bg-black/40 py-1 flex justify-center">
                <span className="text-[10px] text-white font-medium">{t("edit")}</span>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
          </div>

          <div className="flex flex-col gap-2">
            {/* ... Existing Input Fields ... */}
            <div className="flex flex-col gap-1">
              <span className="font-bold text-base">{t("name")}</span>
              <input
                type="text"
                className="py-2 px-4 cardBorder outline-none rounded-sm disabled:text-gray-500"
                placeholder={t("name")}
                value={userName}
                disabled={authType == "email" || authType == "google"}
                onChange={handleChangeUserName}
                required
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-base">{t("email")}</span>
              <input
                type="text"
                className="py-2 px-4 cardBorder outline-none rounded-sm disabled:text-gray-500"
                placeholder={t("email")}
                value={email}
                disabled={authType == "email" || authType == "google"}
                onChange={handleChangeEmail}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-base">{t("mobileNumber")}</span>
              <PhoneInput
                country={setting?.nation_code?.toLowerCase() || process.env.NEXT_PUBLIC_DEFAULT_COUNTRY_CODE}
                value={(countryCode || "").replace("+", "") + phoneNumberWithoutCountryCode}
                onChange={(phone, data) => {
                  const dialCode = data?.dialCode || "";
                  const phoneWithoutDialCode = phone.startsWith(dialCode)
                    ? phone.slice(dialCode.length)
                    : phone;
                  setPhoneNumberWithoutCountryCode(phoneWithoutDialCode);
                  setCountryCode("+" + dialCode);
                }}
                disabled={authType == "phone"}
                containerClass="w-full "
                inputClass="!w-full !py-2 !pl-12 !pr-4 !cardBorder !outline-none !rounded-sm !h-[40px] disabled:text-gray-400"
                buttonClass="!cardBorder !rounded-sm"
                placeholder={t("mobileNumber")}
                inputProps={{
                  placeholder: t("mobileNumber"),
                }}
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-bold text-base">{t("friend_code")}</span>
              <input
                type="text"
                className="py-2 px-4 cardBorder outline-none rounded-sm disabled:text-gray-400"
                placeholder={t("friend_code")}
                value={friendCode}
                onChange={handleFriendCodeChange}
              />
            </div>
            <button
              className="bg-[#29363F] py-2 my-2 px-4 cursor-pointer text-white text-center rounded-sm text-xl font-normal"
              onClick={handleUserRegister}
            >
              {loading ? t("loading") : t("register")}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewUserModal;