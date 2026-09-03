import { t } from "@/utils/translation";
import React from "react";
import { MdOutlineCelebration } from "react-icons/md";
import { useSelector, useDispatch } from "react-redux";
import { clearCartPromo } from "@/redux/slices/cartSlice";
import { useLocalizedRouter } from "@/utils/localizedNav";
import { toast } from "react-toastify";
import { getUncoveredRequiredVariantIds } from "@/utils/prescriptionGroups";

const CartCouponCard = ({
  setShowCouponCode,
  requiresPrescription,
  cartProductsData,
}) => {
  const router = useLocalizedRouter();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.Cart);
  const user = useSelector((state) => state.User);
  const setting = useSelector((state) => state.Setting?.setting);
  const prescriptionGroups = useSelector(
    (state) => state.Checkout.prescriptionGroups
  );

  const handleClearPromo = () => {
    dispatch(clearCartPromo());
  };

  const handleToCheckOut = () => {
    // Guests upload the prescription AFTER login, so don't block them on the
    // prescription check here — prompt login first.
    if (!user?.jwtToken) {
      toast.error(t("login_to_access_checkout_page"));
      return;
    }
    const uncovered = getUncoveredRequiredVariantIds(
      cartProductsData,
      prescriptionGroups
    );
    if (requiresPrescription && uncovered.length > 0) {
      toast.error(t("prescription_required_message"));
      return;
    }
    router.push("/checkout");
  };

  const handleToProducts = () => {
    router.push("/products");
  };

  const cartTotlaWithDiscount =
    cart?.cartSubTotal?.toFixed(
      setting?.decimal_point ? setting?.decimal_point : 0
    ) -
    cart?.promo_code?.discount?.toFixed(
      setting?.decimal_point ? setting?.decimal_point : 0
    );

  return (
    <div className="max-w-[702px] p-4  border  rounded-md cardBorder">
      {user?.jwtToken && (
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium ">{t("have_coupon")}</h3>
          <button
            className="px-3 py-1 text-sm font-medium border rounded hover:primaryBackColor hover:text-white"
            onClick={() => setShowCouponCode(true)}
          >
            {t("view_coupon")}
          </button>
        </div>
      )}

      {cart?.promo_code && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm ">{t("promoCodeSuccess")}</p>
            <button
              onClick={handleClearPromo}
              className=" text-xs font-medium text-red-500 hover:primaryBackColor hover:text-white p-2 rounded-sm"
            >
              {t("delete")}
            </button>
          </div>
          <div className="flex items-center justify-between p-2 mt-2 bg-[#55AE7B0A] primaryBorder  rounded-md">
            <div className="flex items-center space-x-2">
              <span className="primaryColor">
                <MdOutlineCelebration className="primaryColor" size={20} />
              </span>
              <p className="text-base font-bold primaryColor">
                {cart?.promo_code?.promo_code}
              </p>
            </div>
            <p className="text-base font-bold primaryColor">
              {setting?.currency}
              {cart?.promo_code?.discount?.toFixed(
                setting?.decimal_point ? setting?.decimal_point : 0
              )}
            </p>
          </div>
        </div>
      )}

      {/* Pricing Details */}
      <hr className="mb-4 border-gray-300" />
      <div className="mb-4  ">
        <div className="flex justify-between  mt-3 font-bold text-base">
          <p className="">{t("sub_total")}</p>
          <p>
            {setting?.currency}
            {cart?.cartSubTotal?.toFixed(
              setting?.decimal_point ? setting?.decimal_point : 0
            )}
          </p>
        </div>
        {cart?.promo_code && (
          <div className="flex justify-between  mt-3 font-bold text-base">
            <p className="">{t("promoDiscount")}</p>
            <p className="">
              {setting?.currency}
              {cart?.promo_code?.discount?.toFixed(
                setting?.decimal_point ? setting?.decimal_point : 0
              )}
            </p>
          </div>
        )}
      </div>

      <hr className="mb-4 border-gray-300" />

      <div className="flex flex-wrap justify-between gap-2 items-center mb-4 backgroundColor p-3 rounded">
        <p className="text-lg font-bold ">{t("total")}</p>
        <p className="text-lg font-bold">
          {setting?.currency}{" "}
          {cart?.promo_code
            ? cartTotlaWithDiscount?.toFixed(
                setting?.decimal_point ? setting?.decimal_point : 0
              )
            : cart?.cartSubTotal?.toFixed(
                setting?.decimal_point ? setting?.decimal_point : 0
              )}
        </p>
      </div>
              
      <button
        className="w-full py-2 mb-2 text-sm font-medium text-white primaryBackColor rounded md:w-[270px] lg:w-full"
        onClick={handleToCheckOut}
      >
        {t("proceed_to_checkout")}
      </button>
      <button
        className="w-full py-2 rounded-sm text-sm font-medium  hover:primaryBackColor hover:text-white md:w-[270px] lg:w-full"
        onClick={handleToProducts}
      >
        {t("continue_shopping")}
      </button>
    </div>
  );
};

export default CartCouponCard;
