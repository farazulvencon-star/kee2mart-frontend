"use client";
import React, { useEffect, useState } from "react";
import BreadCrumb from "../breadcrumb/BreadCrumb";
import Stepper from "./Stepper";
import AddressCard from "../cards/AddressCard";
import { t } from "@/utils/translation";
import { GoPlus, GoPlusCircle } from "react-icons/go";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { FaRegCalendarAlt } from "react-icons/fa";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import CheckoutPayment from "./CheckoutPayment";
import OrderSummaryCard from "./OrderSummaryCard";
import { useDispatch, useSelector } from "react-redux";
import dynamic from 'next/dynamic';
const NewAddressModal = dynamic(() => import('../newaddressmodal/NewAddressModal'), {
  ssr: false,
});
import * as api from "@/api/apiRoutes";
import {
  clearCartPromo,
  setCartCheckout,
  setCartPromo,
} from "@/redux/slices/cartSlice";
import { setAllAddresses } from "@/redux/slices/addressSlice";
import {
  setAddress,
  setSelectedDate,
  setCurrentStep,
  setTimeSlot,
  setOrderNote,
  setCheckoutTotal,
  setPhonePeCheckoutDetails,
  setOrderType,
} from "@/redux/slices/checkoutSlice";
import { toast } from "react-toastify";
import { useLocalizedRouter } from "@/utils/localizedNav";
import { setCurrentUser } from "@/redux/slices/userSlice";

// Remove: import StripeModal from "./StripeModal";

const StripeModal = dynamic(() => import("./StripeModal"), {
  ssr: false, // Stripe must only load on the client side
});
import PaystackPop from "@paystack/inline-js";
import CheckoutSkeleton from "./CheckoutSkeleton";
import { FiPhoneCall, FiTruck } from "react-icons/fi";
import { MdOutlineStorefront, MdOutlineWatchLater } from "react-icons/md";
import { IoLocationOutline } from "react-icons/io5";

const Checkout = () => {
  const router = useLocalizedRouter();
  const dispatch = useDispatch();

  const city = useSelector((state) => state.City.city);
  const cart = useSelector((state) => state.Cart);
  const address = useSelector((state) => state.Addresses);
  const user = useSelector((state) => state.User.user);
  const setting = useSelector((state) => state.Setting);

  const checkout = useSelector((state) => state.Checkout);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [showStripe, setShowStripe] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);

  // stripe variables
  const [stripeOrderId, setStripeOrderId] = useState(null);
  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [stripeTransactionId, setStripeTransactionId] = useState(null);
  // step 1 variables
  const [isAddressSelected, setIsAddressSelected] = useState(false);
  const [showAddAddres, setShowAddAddres] = useState(false);
  const [checkOutError, setCheckOutError] = useState(false);
  const [checkOutErrorMsg, setCheckOutErrorMsg] = useState("");
  // step 2 Variables
  // const [selectedDate, setSelectedDate] = useState(null)
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [timeSlotsData, setTimeSlotsData] = useState(null);
  const [timeSlots, setTimeSlots] = useState([]);

  const [availabeleTimeSlot, setAvailableTimeSlot] = useState([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // step 3 variables
  const [checkoutData, setCheckoutData] = useState(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState();

  useEffect(() => {
    fetchAddress();
    handleFetchTimeSlots();
    getCurrentUser();
    const orderType =
      cart?.doorstep_delivery_mode != 0 ? "doorstep" : "selfpickup";
    handleOrderType(orderType);
  }, []);

  useEffect(() => {
    validateCouponCode();
  }, [cart?.cart, checkout?.address, cart?.cartProducts]);

  useEffect(() => {
    handleFetchCheckout();
  }, [
    cart?.cart,
    cart?.promo_code,
    checkout?.address,
    cart?.cartProducts,
    checkout?.orderType,
    checkout?.timeSlot,
  ]);

  const getCurrentUser = async () => {
    try {
      const response = await api.getUser();
      dispatch(setCurrentUser({ data: response.user }));
    } catch (error) {
      console.log("error", error);
    }
  };

  const validateCouponCode = async () => {
    try {
      const response = await api.setPromoCode({
        promoCodeName: cart?.promo_code?.promo_code,
        amount: cart?.cartSubTotal,
      });
      if (response.status == 1) {
        dispatch(setCartPromo({ data: response.data }));
      } else {
        dispatch(clearCartPromo());
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  useEffect(() => {
    handleFilterTimeSlots();
  }, [checkout?.selectedDate, timeSlots]);

  const handleFetchCheckout = async () => {
    const couponseCodeId = cart?.promo_code?.promo_code_id;
    try {
      const response = await api.getCart({
        latitude: checkout?.address?.latitude,
        longitude: checkout?.address?.longitude,
        checkout: 1,
        promocode_id: couponseCodeId,
        order_type: checkout?.orderType,
        is_free_delivery: checkout?.timeSlot?.is_free_delivery,
      });
      if (response?.status == 1) {
        dispatch(setCartCheckout({ data: response?.data }));
        dispatch(setCheckoutTotal({ data: response?.data?.total_amount }));
        setCheckoutData(response?.data);
        setCheckOutError(false);
      } else {
        setCheckOutError(true);
        setCheckOutErrorMsg(response?.message);
      }
    } catch (error) {
      console.log("Error", error);
      setCheckOutError(true);
    }
  };

  const handleSelectedDate = (date) => {
    const currentDate = new Date();
    const finalDate = currentDate.setHours(0, 0, 0, 0);
    if (date < finalDate) {
      toast.info(t("please_select_valid_date"));
    }

    dispatch(setSelectedDate({ data: date }));
    dispatch(setTimeSlot({ data: null }));
    setIsPopoverOpen(false);
    handleFilterTimeSlots(date);
  };

  const formatDate = (date) => {
    if (timeSlotsData?.time_slots_is_enabled == "true") {
      if (!date) return t("choose_date");
      return new Date(date).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(
        tomorrow.getDate() + parseInt(timeSlotsData.delivery_estimate_days),
      );
      const finalDate = tomorrow.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      dispatch(setSelectedDate({ data: finalDate }));
      return finalDate;
    }
  };

  const fetchAddress = async () => {
    try {
      const response = await api.getAddress();
      if (response.status == 1) {
        dispatch(setAllAddresses({ data: response.data }));
        const defaultAddress = response?.data?.find(
          (address) => address.is_default == 1,
        );
        if (checkout?.address != null) {
          return;
        } else if (!defaultAddress) {
          dispatch(setAddress({ data: response?.data[0] }));
        } else {
          dispatch(setAddress({ data: defaultAddress }));
        }
        setLoading(false);
      } else {
        setLoading(false);
        dispatch(setAllAddresses({ data: [] }));
      }
    } catch (error) {
      setLoading(false);
      console.log("Error", error);
    }
  };

  const handleFilterTimeSlots = () => {
    const currentDate = new Date();
    const userSelectedDate = new Date(
      checkout?.selectedDate ? checkout?.selectedDate : new Date(),
    );

    const updatedTimeSlots = timeSlots.map((slot) => {
      // Create date object for the slot's last order time
      const lastOrderTime = new Date(checkout?.selectedDate);
      const [hours, minutes, seconds] = slot.last_order_time
        .split(":")
        .map(Number);
      lastOrderTime.setHours(hours, minutes, seconds);

      const isToday =
        userSelectedDate.toDateString() === currentDate.toDateString();
      const isDisabled = isToday && currentDate >= lastOrderTime;

      return {
        ...slot,
        isDisabled,
      };
    });

    setAvailableTimeSlot(updatedTimeSlots);
  };

  const handleFetchTimeSlots = async (selectedDate) => {
    setLoading(true);
    try {
      const response = await api.getTimeSlots();
      const allTimeSlots = response?.data?.time_slots || [];
      setTimeSlotsData(response?.data);
      setTimeSlots(allTimeSlots);
      handleFilterTimeSlots(selectedDate);
      setLoading(false);
    } catch (error) {
      console.log("Error", error);
      setLoading(false);
    }
  };

  const handleTimeSlotChange = (value) => {
    if (value.isDisabled == true) {
      toast.error(t("please_select_valid_time_slot"));
      return;
    }
    setSelectedTimeSlot(value);
    dispatch(setTimeSlot({ data: value }));
  };

  const handleOrderType = (value) => {
    dispatch(setOrderType({ data: value }));
  };

  const handleChangeOrderNote = (e) => {
    dispatch(setOrderNote({ data: e.target.value }));
  };

  const handleShowAddress = () => {
    setIsAddressSelected(false);
    setShowAddAddres(true);
  };

  const handleFirstStep = () => {
    if (checkOutError) {
      toast.error(checkOutErrorMsg);
      // toast.error(t(checkOutErrorMsg));
      return;
    } else {
      dispatch(setCurrentStep({ data: 2 }));
    }
  };

  const handleSecondStep = () => {
    if (
      checkout?.selectedDate == null &&
      timeSlotsData?.time_slot_setting == "true"
    ) {
      toast.error(t("please_select_date"));
      return;
    } else if (
      timeSlotsData?.time_slots_is_enabled == "true" &&
      checkout?.timeSlot == null
    ) {
      toast.error(t("please_select_time_slot"));
      return;
    }

    dispatch(setCurrentStep({ data: 3 }));
  };

  const handlePickupOrderStep = () => {
    if (checkOutError) {
      toast.error(t(checkOutErrorMsg));
      return;
    } else {
      dispatch(setCurrentStep({ data: 3 }));
    }
  };

  const formatDateToDDMMYYYY = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatDateWithTimeSlot = (date, timeSlot) => {
    const formattedDate = formatDateToDDMMYYYY(date);
    return timeSlot
      ? `${formattedDate} ${timeSlot.default_title}`
      : formattedDate;
  };

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      // document.body.appendChild(script);
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    });
  };

  const handleRozarpayPayment = async (
    order_id,
    razorpay_transaction_id,
    amount,
    capilizePaymeneMethod,
  ) => {
    try {
      const res = await initializeRazorpay();
      if (!res) {
        console.error("RazorPay SDK Load Failed");
        return;
      }
      const key = setting?.payment_setting?.razorpay_key;
      const convertedAmount = Math.floor(amount * 100);
      const options = {
        key: key,
        amount: convertedAmount,
        currency: "INR",
        name: user?.user?.name,
        description: setting?.setting?.app_name,
        image: setting?.setting?.web_settings.web_logo,
        order_id: razorpay_transaction_id,
        handler: async (res) => {
          if (res.razorpay_payment_id) {
            try {
              setPaymentLoading(true);
              const response = await api.addTransaction({
                orderId: order_id,
                transactionId: res.razorpay_payment_id,
                paymentMethod: capilizePaymeneMethod,
                type: "order",
              });
              if (response.status === 1) {
                setPaymentLoading(false);
                return router.push(
                  `/web-payment-status?status=success&type=order&payment_method=${checkout?.selectedPaymentMethod}&order_id=${order_id}`,
                );
              } else {
                setPaymentLoading(false);
                toast.error(response.message);
              }
            } catch (error) {
              console.error("Transaction error:", error);
            }
          }
        },
        modal: {
          confirm_close: true,
          ondismiss: async (reason) => {
            if (reason === undefined) {
              await handleRazorpayCancel(order_id);
              // dispatch(deductUserBalance({ data: walletDeductionAmt || 0 }));
            }
          },
        },
        prefill: {
          name: user?.user?.name,
          email: user?.user?.email,
          contact: user?.user?.mobile,
        },
        notes: {
          address: "Razorpay Corporate",
        },
        theme: {
          color: setting?.setting?.web_settings.color,
        },
      };

      const rzpay = new window.Razorpay(options);
      rzpay.on("payment.cancel", (response) => {
        handleRazorpayCancel(order_id);
      });
      rzpay.on("payment.failed", (response) => {
        api.deleteOrder({ orderId: order_id });
      });
      rzpay.open();
    } catch (error) {
      console.error("Error initializing Razorpay:", error);
    }
  };

  const handleRazorpayCancel = async (order_id) => {
    await api.deleteOrder({ orderId: order_id });
  };

  const handlePayStackPayment = async (
    orderId,
    amount,
    capilizePaymeneMethod,
  ) => {
    try {
      const handler = PaystackPop.setup({
        key:
          setting.payment_setting &&
          setting.payment_setting.paystack_public_key,
        email: user && user?.email,
        amount: parseFloat(amount) * 100,
        currency:
          setting?.payment_setting &&
          setting?.payment_setting?.paystack_currency_code,
        ref: new Date().getTime().toString(),
        label: setting?.setting && setting?.setting?.support_email,
        onClose: function () {
          api.deleteOrder({ orderId: orderId });
          // setWalletAmount(user.user.balance);
          // dispatch(setWallet({ data: 0 }));
        },
        callback: async function (res) {
          try {
            setPaymentLoading(true);
            const response = await api.addTransaction({
              orderId: orderId,
              transactionId: res.reference,
              paymentMethod: capilizePaymeneMethod,
              type: "order",
            });
            if (response.status == 1) {
              setPaymentLoading(false);
              return router.push(
                `/web-payment-status?status=success&type=order&payment_method=${checkout?.selectedPaymentMethod}&order_id=${orderId}`,
              );
            } else {
              setPaymentLoading(false);
              toast.error(response.message);
            }
          } catch (error) {
            console.log("Error", error);
          }
        },
      });
      handler.openIframe();
    } catch (error) {
      console.log("Paytabs Error", error);
    }
  };

  const handlePlaceOrder = async () => {
    const formatDate = formatDateWithTimeSlot(
      checkout?.selectedDate,
      checkout?.timeSlot,
    );
    const capilizePaymeneMethod =
      checkout?.selectedPaymentMethod === "dpo"
        ? "DPO"
        : String(checkout?.selectedPaymentMethod).charAt(0).toUpperCase() +
          String(checkout?.selectedPaymentMethod).slice(1);
    const status =
      checkout?.selectedPaymentMethod === "COD" ||
      checkout?.selectedPaymentMethod === "wallet"
        ? 2
        : 1;
    try {
      if (checkout?.selectedPaymentMethod == null) {
        toast.error(t('please_select_payment_method'));
        return;
      } else if (
        checkout?.selectedDate == null &&
        checkout?.orderType == "doorstep" &&
        timeSlotsData?.time_slot_setting == "true"
      ) {
        toast.error(t("please_select_date"));
        return;
      } else if (
        checkout?.address == null &&
        checkout?.orderType == "doorstep"
      ) {
        toast.error(t("please_select_address"));
        return;
      } else {
        setCheckoutLoading(true);
        const response = await api.placeOrder({
          productVariantId: cart?.checkout?.product_variant_id,
          quantity: cart?.checkout?.quantity,
          total: cart?.checkout?.sub_total,
          deliveryCharge:
            cart?.checkout?.delivery_charge?.total_delivery_charge,
          finalTotal: checkout?.checkoutTotal,
          walletUsed: checkout?.isWalletChecked,
          walletBalance: checkout?.usedWalletBalance,
          addressId: checkout?.address?.id,
          deliveryTime: formatDate,
          orderNote: checkout?.orderNote,
          paymentMethod: checkout?.selectedPaymentMethod,
          promocodeId: cart?.promo_code?.promo_code_id,
          status: status,
          order_type: checkout?.orderType,
          prescriptionGroups: checkout?.prescriptionGroups?.map((g) => ({
            productVariantIds: g.productIds,
            images: g.images?.map((img) => img.file),
          })),
        });
        if (response?.status == 1) {
          dispatch(setOrderNote(""));
          if (
            checkout?.selectedPaymentMethod === "COD" ||
            checkout?.selectedPaymentMethod === "wallet"
          ) {
            setCheckoutLoading(false);
            await handleInitiateTransaction();
          } else {
            setOrderId(response?.data?.order_id);
            setCheckoutLoading(false);
            await handleInitiateTransaction(
              response?.data?.order_id,
              capilizePaymeneMethod,
            );
          }
        } else {
          setCheckoutLoading(false);
          toast.error(response?.message);
        }
      }
    } catch (error) {
      setCheckoutLoading(false);
      console.log("Error", error);
    }
  };

  const handleInitiateTransaction = async (
    currentOrderID,
    capilizePaymeneMethod,
  ) => {
    try {
      if (checkout?.selectedPaymentMethod == "COD") {
        // redirect after successfull COD order
        return router.push(
          `/web-payment-status?status=success&type=order&payment_method=${checkout?.selectedPaymentMethod}`,
        );
      } else if (checkout?.selectedPaymentMethod == "wallet") {
        // redirect after successfull wallet order
        return router.push(
          `/web-payment-status?status=success&type=order&payment_method=${checkout?.selectedPaymentMethod}`,
        );
      } else if (checkout?.selectedPaymentMethod == "paystack") {
        handlePayStackPayment(
          currentOrderID,
          checkout?.checkoutTotal,
          capilizePaymeneMethod,
        );
      } else {
        const response = await api.initiateTrasaction({
          orderId: currentOrderID,
          paymentMethod: capilizePaymeneMethod,
          type: "order",
        });
        if (response.status == 1) {
          if (checkout?.selectedPaymentMethod == "phonepe") {
            dispatch(setPhonePeCheckoutDetails(response?.data));
          }
          if (checkout?.selectedPaymentMethod == "razorpay") {
            handleRozarpayPayment(
              currentOrderID,
              response?.data?.transaction_id,
              checkout?.checkoutTotal,
              capilizePaymeneMethod,
            );
          } else if (checkout?.selectedPaymentMethod == "stripe") {
            setStripeOrderId(currentOrderID);
            setStripeClientSecret(response?.data?.client_secret);
            setStripeTransactionId(response?.data?.id);
            setShowStripe(true);
          } else {
            dispatch(clearCartPromo());
            //  payment methods redirect urls
            const paymentUrls = {
              cashfree: response?.data?.redirectUrl,
              phonepe: response?.data?.redirectUrl,
              paytabs: response?.data?.redirectUrl,
              paypal: response?.data?.paypal_redirect_url,
              midtrans: response?.data?.snapUrl,
              dpo: response?.data?.redirectUrl,
            };
            // Select specific paymentUrls
            const redirectUrl = paymentUrls[checkout?.selectedPaymentMethod];
            if (redirectUrl) {
              router.push(redirectUrl);
            } else {
              console.error(
                "Unsupported payment method:",
                selectedPaymentMethod,
              );
            }
          }
        } else {
          // setIsOrderPlaced(false)
          await api.deleteOrder({ orderId: orderId });
          toast.error(response?.message);
        }
      }
    } catch (error) {
      console.log(("Error", error));
    }
  };

  const handleLocationRedirect = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, "_blank");
  };

  const handleOptionsClick = (type) => {
    if (type == "doorstep" && cart?.doorstep_delivery_mode == 0) {
      toast.error(t("doorStepDeliveryDisableNote"));
    } else if (type == "selfpickup" && cart?.self_pickup_mode == 0) {
      toast.error(t("selfPickUpDisabledNote"));
    } else {
      return;
    }
  };

  return loading == true ? (
    <CheckoutSkeleton />
  ) : (
    <section>
      <BreadCrumb />
      <div className="container px-2">
        {paymentLoading ? (
          <CheckoutSkeleton />
        ) : (
          <div className="flex justify-center flex-col items-center">
            <div
              className={`flex w-full ${
                checkout?.orderType == "doorstep" ? "lg:w-1/2" : "lg:w-1/4"
              }`}
            >
              <Stepper currentStep={checkout?.currentStep} />
            </div>
            <div className="w-full">
              <div className="grid grid-cols-12 gap-2 md:gap-6">
                {checkout?.currentStep == 1 && (
                  <div className="col-span-12 md:col-span-8 lg:col-span-9">
                    <div className="flex flex-col cardBorder rounded-sm mb-4 backgroundColor p-4 gap-6">
                      <h2 className="font-bold text-base md:text-xl">
                        {t("choose_delivery_method")}
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div
                          className="flex flex-col"
                          onClick={() => handleOptionsClick("doorstep")}
                        >
                          <label className="flex items-center gap-3 p-4 border rounded-md cursor-pointer  transition bodyBackgroundColor">
                            <input
                              type="radio"
                              name="delivery"
                              value="doorstep"
                              checked={checkout?.orderType == "doorstep"}
                              className="primaryAccentColor scale-150"
                              disabled={cart?.doorstep_delivery_mode == 0}
                              onChange={(e) => handleOrderType(e.target.value)}
                            />
                            <div className="flex items-center gap-3">
                              <div className=" rounded-md  primaryFilledColor addToCartColor p-3 dark:text-black">
                                <FiTruck size={22} />
                              </div>
                              <div>
                                <p className="font-bold">
                                  {t("home_delivery")}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {t("get_it_deliverd_to_your_address")}
                                </p>
                              </div>
                            </div>
                          </label>
                        </div>
                        <div
                          className="flex flex-col"
                          onClick={() => handleOptionsClick("selfpickup")}
                        >
                          <label className="flex items-center gap-3 p-4 border rounded-md cursor-pointer transition bodyBackgroundColor peer-disabled:disabledBackgroundColor">
                            <input
                              type="radio"
                              name="delivery"
                              value="selfpickup"
                              disabled={cart?.self_pickup_mode == 0}
                              checked={checkout?.orderType == "selfpickup"}
                              className="primaryAccentColor scale-150"
                              onChange={(e) => handleOrderType(e.target.value)}
                            />

                            <div className="flex items-center gap-3">
                              <div className="p-3 rounded-md primaryFilledColor addToCartColor dark:text-black">
                                <MdOutlineStorefront size={22} />
                              </div>
                              <div>
                                <p className="font-bold">{t("store_pickup")}</p>
                                <p className="text-sm text-gray-500">
                                  {t("pick_up_from_store")}
                                </p>
                              </div>
                            </div>
                          </label>
                          {cart?.self_pickup_mode == 0 && (
                            <p className="text-xs text-red-600 px-2 my-1">
                              {t("selfPickUpDisabledNote")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {checkout?.orderType == "doorstep" ? (
                      <div className="flex flex-col cardBorder rounded-sm mb-4">
                        <div className="flex justify-between backgroundColor py-4 px-2 ">
                          <span className="font-bold text-base md:text-xl">
                            {t("choose_delivery_address")}
                          </span>
                          {address?.allAddresses?.length > 0 && (
                            <button
                              className="flex  items-center text-sm"
                              onClick={handleShowAddress}
                            >
                              <GoPlus />
                              {t("add_address")}
                            </button>
                          )}
                        </div>
                        {address?.allAddresses?.length > 0 ? (
                          <>
                            {" "}
                            <div className="flex flex-col h-full">
                              {address?.allAddresses?.map((address) => {
                                return (
                                  <div key={address?.id}>
                                    {" "}
                                    <AddressCard
                                      address={address}
                                      setShowAddAddres={setShowAddAddres}
                                      setIsAddressSelected={
                                        setIsAddressSelected
                                      }
                                      fetchAddress={fetchAddress}
                                    />
                                  </div>
                                );
                              })}
                            </div>
                            <div className="flex justify-end m-4">
                              <button
                                onClick={handleFirstStep}
                                className="text-white primaryBackColor px-4 py-2 rounded-sm text-xl font-normal"
                              >
                                {t("continue")}
                              </button>
                            </div>
                          </>
                        ) : (
                          <div
                            className=" flex justify-center  my-2 cursor-pointer"
                            onClick={() => setShowAddAddres(true)}
                          >
                            <div className="border-2 border-dashed p-3 w-1/3  flex items-center justify-center gap-2 font-bold text-xl">
                              <GoPlusCircle /> {t("add_address")}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-base font-bold ">
                            {t("order_note_title")}
                          </span>
                          <textarea
                            name=""
                            id=""
                            className="cardBorder rounded-sm w-full p-2 outline-none"
                            value={checkout?.orderNote}
                            onChange={(e) => handleChangeOrderNote(e)}
                            placeholder={t("order_note")}
                            maxLength={256}
                          ></textarea>
                        </div>
                        <div className="flex flex-col cardBorder rounded-sm mb-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex item-center gap-2 border-b p-4 ">
                              <MdOutlineStorefront size={28} />
                              <span className="font-bold text-base md:text-xl">
                                {t("pickup_from_store")}
                              </span>
                            </div>
                            <div className="flex flex-col h-full p-4   border-b gap-6">
                              <div className="flex justify-between items-center">
                                <div className="flex gap-2 items-center">
                                  <IoLocationOutline size={22} />
                                  <div className="flex flex-col gap-1">
                                    <h2 className="font-bold text-base">
                                      {
                                        checkoutData?.seller_self_pickup
                                          ?.seller_name
                                      }
                                    </h2>
                                    <p className="font-medium">
                                      {
                                        checkoutData?.seller_self_pickup
                                          ?.pickup_store_address
                                      }
                                    </p>
                                  </div>
                                </div>
                                <div>
                                  <button
                                    className="px-4 py-2 flex item-center footer text-white rounded-md gap-1"
                                    onClick={() => {
                                      handleLocationRedirect(
                                        checkoutData?.seller_self_pickup
                                          ?.pickup_latitude,
                                        checkoutData?.seller_self_pickup
                                          ?.pickup_longitude,
                                      );
                                    }}
                                  >
                                    <IoLocationOutline size={22} />
                                    {t("direction")}
                                  </button>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <div className="flex gap-2 items-center">
                                  <FiPhoneCall size={20} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <h2 className="font-bold text-base">
                                    {t("phone")}
                                  </h2>
                                  <p className="font-medium">
                                    {
                                      checkoutData?.seller_self_pickup
                                        ?.seller_mobile
                                    }
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <div className="flex gap-2 items-center">
                                  <MdOutlineWatchLater size={20} />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <h2 className="font-bold text-base">
                                    {t("open_hours")}
                                  </h2>
                                  <p className="font-medium">
                                    {`${t("today")} ${
                                      checkoutData?.seller_self_pickup
                                        .opening_time
                                    } - ${
                                      checkoutData?.seller_self_pickup
                                        .closing_time
                                    }`}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end m-4">
                            <button
                              onClick={handlePickupOrderStep}
                              className="text-white primaryBackColor px-4 py-2 rounded-sm text-xl font-normal"
                            >
                              {t("continue")}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* step 2 */}
                {checkout?.currentStep == 2 && (
                  <div className="col-span-12 md:col-span-8 lg:col-span-9">
                    <div className="flex flex-col cardBorder rounded-sm mb-4 w-full">
                      <div className="flex  justify-between backgroundColor p-4">
                        <span className="font-bold text-xl">
                          {timeSlotsData?.time_slot_setting == "true"
                            ? t("preferred_day_and_time")
                            : t("order_note_title")}
                        </span>
                      </div>
                      <div className="flex flex-col p-4 gap-6">
                        {timeSlotsData?.time_slot_setting == "true" && (
                          <div className="grid grid-cols-12 items-center gap-4">
                            <div className="col-span-12  md:col-span-6 flex flex-col gap-1 ">
                              <span className="text-base font-bold">
                                {timeSlotsData?.time_slots_is_enabled == "true"
                                  ? t("preferred_delivery_day")
                                  : t("estimage_delivery_date")}
                                <span className="text-red-500">*</span>
                              </span>

                              <Popover open={isPopoverOpen}>
                                <PopoverTrigger
                                  className="cardBorder w-full  px-4 py-2 rounded-sm items-center flex justify-between "
                                  onClick={() =>
                                    setIsPopoverOpen(!isPopoverOpen)
                                  }
                                >
                                  {formatDate(checkout?.selectedDate)}
                                  <FaRegCalendarAlt />
                                </PopoverTrigger>
                                {timeSlotsData?.time_slots_is_enabled ==
                                  "true" && (
                                  <PopoverContent className="w-full p-0">
                                    <Calendar
                                      mode="single"
                                      selected={checkout?.selectedDate}
                                      onSelect={handleSelectedDate}
                                      className="rounded-md w-full"
                                      // NOTE: change in version 2.0.4
                                      fromDate={(() => {
                                        let date = new Date();
                                        date.setDate(
                                          date.getDate() +
                                            parseInt(
                                              timeSlotsData.delivery_estimate_days -
                                                1,
                                            ),
                                        );
                                        return date;
                                      })()}
                                      toDate={(() => {
                                        let date = new Date();
                                        let allowedDays =
                                          parseInt(
                                            setting?.setting
                                              ?.time_slots_allowed_days,
                                          ) || 15;
                                        date.setDate(
                                          date.getDate() +
                                            parseInt(
                                              timeSlotsData.delivery_estimate_days -
                                                1,
                                            ) +
                                            (allowedDays - 1),
                                        );
                                        return date;
                                      })()}
                                    />
                                  </PopoverContent>
                                )}
                              </Popover>
                            </div>
                            {timeSlotsData?.time_slots_is_enabled == "true" && (
                              <div className="col-span-12 md:col-span-6  flex flex-col gap-1">
                                <span className="text-base font-bold ">
                                  {t("preferred_delivery_time")}
                                  <span className="text-red-500">*</span>
                                </span>
                                <Select
                                  onValueChange={handleTimeSlotChange}
                                  value={selectedTimeSlot}
                                >
                                  <SelectTrigger className="w-full py-5 cardBorder">
                                    <SelectValue placeholder="Select a timezone">
                                      {checkout?.timeSlot?.title}
                                    </SelectValue>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {availabeleTimeSlot?.map((slot) => {
                                      return (
                                        <div key={slot?.id}>
                                          <SelectItem
                                            value={slot}
                                            style={{
                                              opacity:
                                                slot.isDisabled == "true"
                                                  ? 0.0
                                                  : 1,
                                            }}
                                            className={`
                                              ${slot.isDisabled == true ? "opacity-10 cursor-not-allowed text-gray-500 hover:text-gray-500" : ""}
                                            `}
                                          >
                                            <div className="flex justify-between items-center w-full ">
                                              <p className="">
                                                {slot?.translations?.title}
                                              </p>
                                              <p className="whitespace-nowrap ml-64">
                                                {slot?.is_free_delivery
                                                  ? t("freedelivery")
                                                  : ""}
                                              </p>
                                            </div>
                                          </SelectItem>
                                        </div>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              </div>
                            )}
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-base font-bold ">
                            {t("order_note_title")}
                          </span>
                          <textarea
                            name=""
                            id=""
                            className="cardBorder rounded-sm w-full p-2 outline-none"
                            value={checkout?.orderNote}
                            onChange={(e) => handleChangeOrderNote(e)}
                            placeholder={t("order_note")}
                            maxLength={256}
                          ></textarea>
                        </div>
                        <div className="flex justify-end gap-4">
                          <button
                            className="cardBorder px-4 py-2 rounded-sm text-xl font-normal"
                            onClick={() =>
                              dispatch(setCurrentStep({ data: 1 }))
                            }
                          >
                            {t("previous")}
                          </button>
                          <button
                            className="text-white primaryBackColor px-4 py-2 rounded-sm text-xl font-normal"
                            onClick={handleSecondStep}
                          >
                            {t("continue")}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {/* step 3 */}
                {checkout?.currentStep == 3 && (
                  <div className="md:col-span-8 lg:col-span-9 col-span-12">
                    <CheckoutPayment
                      checkoutData={checkoutData}
                      selectedPaymentMethod={selectedPaymentMethod}
                      setSelectedPaymentMethod={setSelectedPaymentMethod}
                      setCurrentStep={setCurrentStep}
                    />
                  </div>
                )}
                <div className=" md:col-span-4 lg:col-span-3 col-span-12">
                  <OrderSummaryCard
                    step={checkout?.currentStep}
                    checkoutData={checkoutData}
                    handlePlaceOrder={handlePlaceOrder}
                    checkOutError={checkOutError}
                    checkoutLoading={checkoutLoading}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {showAddAddres && (<NewAddressModal
        fetchAddress={fetchAddress}
        showAddAddres={showAddAddres}
        setShowAddAddres={setShowAddAddres}
        isAddressSelected={isAddressSelected}
      />)}
      {showStripe && (<StripeModal
        showStripe={showStripe}
        setShowStripe={setShowStripe}
        amount={checkout?.checkoutTotal}
        clientSecret={stripeClientSecret}
        stripeTransId={stripeTransactionId}
        stripeOrderId={stripeOrderId}
        type="order"
      />)}
      {/* <OrderSuccessModal showOrderSuccess={showOrderSuccess} handlePaymentClose={handlePaymentClose} /> */}
    </section>
  );
};

export default Checkout;
