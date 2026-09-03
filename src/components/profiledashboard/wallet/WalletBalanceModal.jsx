import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { t } from "@/utils/translation";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import * as api from "@/api/apiRoutes";
import { RiCloseFill } from "react-icons/ri";
import { toast } from "react-toastify";
import { useLocalizedRouter } from "@/utils/localizedNav";
import { addUserBalance } from "@/redux/slices/userSlice";
import { CiWallet } from "react-icons/ci";
let PaystackPop;

if (typeof window !== "undefined") {
  import("@paystack/inline-js").then((module) => {
    PaystackPop = module.default;
  });
}
// payment SVGS
import CashfreeImage from "@/assets/payment_methods_svgs/ic_cashfree.svg";
import RazorpayImage from "@/assets/payment_methods_svgs/ic_razorpay.svg";
import PaypalImage from "@/assets/payment_methods_svgs/ic_paypal.svg";
import PaystackImage from "@/assets/payment_methods_svgs/ic_paystack.svg";
import StriperImage from "@/assets/payment_methods_svgs/ic_stripe.svg";
import MidtransImage from "@/assets/payment_methods_svgs/Midtrans.svg";
import PhonePeImage from "@/assets/payment_methods_svgs/Phonepe.svg";
import PaytabsImage from "@/assets/payment_methods_svgs/ic_paytabs.svg";
import DpoImage from "@/assets/payment_methods_svgs/ic_dpo_full.svg";
// import StripeModal from "@/components/checkoutpage/StripeModal";
import dynamic from "next/dynamic";

const StripeModal = dynamic(() => import("@/components/checkoutpage/StripeModal"), {
  ssr: false,
});
import { setPhonePeCheckoutDetails } from "@/redux/slices/checkoutSlice";

const paymentMethodsConfig = [
  { key: "razorpay_payment_method", label: "razorpay", image: RazorpayImage },
  { key: "paypal_payment_method", label: "paypal", image: PaypalImage },
  { key: "paystack_payment_method", label: "paystack", image: PaystackImage },
  { key: "stripe_payment_method", label: "stripe", image: StriperImage },
  { key: "cashfree_payment_method", label: "cashfree", image: CashfreeImage },
  { key: "midtrans_payment_method", label: "midtrans", image: MidtransImage },
  { key: "phonepay_payment_method", label: "phonepe", image: PhonePeImage },
  { key: "paytabs_payment_method", label: "paytabs", image: PaytabsImage },
  { key: "dpo_payment_method", label: "dpo", image: DpoImage },
];

const WalletBalanceModal = ({
  addWalletModal,
  setAddWalletModal,
  type = "wallet",
  selectedPlan = null,
}) => {
  const setting = useSelector((state) => state.Setting);
  const user = useSelector((state) => state?.User);
  const dispatch = useDispatch();
  const router = useLocalizedRouter();

  const [selectedPaymentMethod, setSelectPaymentMethod] = useState();
  const [amount, setAmount] = useState(null);
  const [showStripe, setShowStripe] = useState(false);
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [stripeTransId, setStripeTransId] = useState(null);

  const handleSelectedPaymentMethod = (value) => {
    setSelectPaymentMethod(value);
  };

  const enabledPaymentMethods = paymentMethodsConfig.filter(
    (method) =>
      setting?.payment_setting?.[method.key] &&
      setting?.payment_setting?.[method.key] === "1"
  );

  const handleAmount = (e) => {
    setAmount(Number(e.target.value));
  };

  useEffect(() => {
    if (addWalletModal === false) {
      setSelectPaymentMethod();
      setAmount(null);
    }
  }, [addWalletModal]);


  const handleSubmit = async () => {
    if (type == "wallet") {
      if (amount === null) {
        toast.error(t("wallet_amount_required"));
        return;
      } else if (amount <= 0) {
        toast.error(t("wallet_amount_must_be_greater_than_zero"));
        return;
      } else if (selectedPaymentMethod === undefined) {
        toast.error(t("wallet_payment_method_required"));
        return;
      } else if (amount % 1 !== 0) {
        toast.error(t("wallet_amount_cannot_be_decimal"));
        return;
      }
    }

    if (type == "subscription") {
      if (selectedPlan?.id === null) {
        toast.error(t("please_select_a_plan"));
        return;
      }
    }

    const subscriptionPlanPrice = selectedPlan?.discounted_price ? selectedPlan?.discounted_price : selectedPlan?.price;

    if (selectedPaymentMethod === "wallet") {
      if (user?.user?.balance < subscriptionPlanPrice) {
        toast.error(t("insufficient_wallet_balance"));
        return;
      }
    }

    const capitalizedPaymentMethod =
      selectedPaymentMethod === "dpo"
        ? "DPO"
        : selectedPaymentMethod.charAt(0).toUpperCase() +
          selectedPaymentMethod.slice(1);

    if (capitalizedPaymentMethod !== "Paystack") {
      const result = await api.initiateTrasaction({
        paymentMethod: capitalizedPaymentMethod,
        type: type,
        walletAmount: amount,
        subscriptionPlanId: selectedPlan?.id
      });
      if (result?.status === 1) {
        if (capitalizedPaymentMethod === "Razorpay") {
          handleRazorpayPayment(null, result?.data?.transaction_id, amount);
        } else if (capitalizedPaymentMethod === "Stripe") {
          setStripeClientSecret(result?.data?.client_secret);
          setStripeTransId(result?.data?.id);
          setShowStripe(true);
          // setAddWalletModal(false);
        } else if (capitalizedPaymentMethod === "Wallet") {
          toast.success(t('subscription_add_description'))
          setAddWalletModal(false);
          setTimeout(() => {
            router.push('/profile/subscription')
          }, 2000);
        }
        else {
          if (capitalizedPaymentMethod == "Phonepe") {
            dispatch(setPhonePeCheckoutDetails(result?.data));
          }
          const paymentUrls = {
            cashfree: result?.data?.redirectUrl,
            phonepe: result?.data?.redirectUrl,
            paytabs: result?.data?.redirectUrl,
            paypal: result?.data?.paypal_redirect_url,
            midtrans: result?.data?.snapUrl,
            dpo: result?.data?.redirectUrl,
          };
          // Select specific paymentUrls
          const redirectUrl = paymentUrls[selectedPaymentMethod];
          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            console.error("Unsupported payment method:", selectedPaymentMethod);
          }
        }
      } else {
        setAddWalletModal(false);
        toast.error(result?.message);
      }
    } else {
      handlePayStackPayment(type, selectedPlan, amount, capitalizedPaymentMethod);
    }
  };

  const handlePayStackPayment = async (
    type,
    selectedPlan,
    amount,
    capilizePaymeneMethod
  ) => {
    const finalAmount = type === "subscription" ? selectedPlan?.price : amount;
    try {
      const handler = PaystackPop.setup({
        key:
          setting.payment_setting &&
          setting.payment_setting.paystack_public_key,
        email: user && user?.user?.email,
        amount: parseFloat(finalAmount) * 100,
        currency:
          setting?.payment_setting &&
          setting?.payment_setting?.paystack_currency_code,
        ref: new Date().getTime().toString(),
        label: setting?.setting && setting?.setting?.support_email,
        onClose: function () {
          // api.deleteOrder({ orderId: orderId });
          setAddWalletModal(false);
        },
        onError: (error) => {
          console.log("Error: ", error.message);
        },
        callback: async function (res) {
          try {
            // setPaymentLoading(true)
            const response = await api.addTransaction({
              transactionId: res.reference,
              paymentMethod: capilizePaymeneMethod,
              type: type,
              subscriptionPlanId: selectedPlan?.id,
              walletAmount: amount,
            });
            if (response.status == 1) {
              // setPaymentLoading(true)
              // toast.success(response.message);
              dispatch(addUserBalance({ data: amount }));
              setAddWalletModal(false);
              router.push(
                `/web-payment-status?type=${type}&status_code=200&status=success`
              );
              // setIsOrderPlaced(true);
              // dispatch(setCartSubTotal({ data: 0 }));
            } else {
              // setPaymentLoading(true)
              toast.error(response.message);
              setAddWalletModal(false);
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

  const handleRazorpayPayment = async (
    order_id,
    razorpay_transaction_id,
    amount
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
              const response = await api.addTransaction({
                transactionId: res.razorpay_payment_id,
                paymentMethod:
                  selectedPaymentMethod.charAt(0).toUpperCase() +
                  selectedPaymentMethod.slice(1),
                type: type,
                subscriptionPlanId: selectedPlan?.id,
                walletAmount: amount,
              });
              if (response.status === 1) {
                dispatch(addUserBalance({ data: amount }));
                setAddWalletModal(false);
                router.push(
                  `/web-payment-status?type=${type}&status_code=200&status=success`
                );
              } else {
                toast.error(response.message);
                setAddWalletModal(false);
              }
            } catch (error) {
              console.log("Transaction error:", error);
            }
          } else {
            console.log("Razorpay Payment Failed");
          }
        },
        modal: {
          confirm_close: true,
          ondismiss: async (reason) => {
            if (reason === undefined) {
              setAddWalletModal(false);
            }
          },
        },
        retry: {
          enabled: false,
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

      // if (typeof window !== "undefined") {
      const rzpay = new window.Razorpay(options);
      rzpay.on("payment.cancel", (response) => {
        alert("Payment Cancelled");
        toast.error("Payment Cancelled");
      });

      rzpay.on("payment.failed", (response) => {
        setAddWalletModal(false);
        router.push(`/web-payment-status?type=${type}&status=failed`);
      });

      rzpay.open();
    } catch (error) {
      console.error("Error initializing Razorpay:", error);
    }
  };

  return (
    <div>
      <Dialog
        open={addWalletModal}
        onOpenChange={setAddWalletModal}
        className="bg-black h-full w-full"
      >
        {addWalletModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 z-40"></div>
        )}
        <DialogContent aria-describedby="addWalletModal " className="max-h-[100vh]  border-0 overflow-y-auto">
          <DialogHeader className="flex flex-row justify-between items-center">
            <DialogTitle>
              <h1 className="font-bold text-xl">
                {type == "wallet" ? t("add_to_wallet") : t("complete_payment")}
              </h1>
            </DialogTitle>
            <div className="closeButtonBg rounded-full p-[8px] cursor-pointer">
              <RiCloseFill
                size={22}
                onClick={() => setAddWalletModal(false)}
              />
            </div>
          </DialogHeader>
          <div >
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <>
                  {type == "wallet" ? (
                    <>
                      <label htmlFor="walletAmount" className="text-xl">
                        {t("amount")}
                      </label>
                      <input
                        type="number"
                        id="walletAmount"
                        value={amount !== null ? amount : ""}
                        placeholder={t("type_amount")}
                        className="py-2 px-4 cardBorder rounded-sm outline-none text-xl placeholder:text-xl"
                        onChange={(e) => handleAmount(e)}
                      />
                    </>
                  ) : (
                    <div className="w-full backgroundColor p-4 rounded-md border-1">
                      <div
                        className="space-y-2 pb-4"
                        style={{ borderColor: "var(--border-color)" }}
                      >
                        <div
                          className={
                            "flex justify-between items-center py-2 border-b-2 border-dashed"
                          }
                        >
                          <span className="font-bold text-base">
                            {t("subscription_plan")}
                          </span>
                          <span className="font-bold text-base textColor">
                            {selectedPlan?.name}
                          </span>
                        </div>

                        <div
                          className={"flex justify-between items-center py-2"}
                        >
                          <span className="text-base font-medium ">
                            {t("original_price")}
                          </span>
                          <span className=" font-semibold ">
                            <span className="text-xl">
                              {setting?.setting?.currency}{selectedPlan?.discounted_price > 0 ? selectedPlan?.discounted_price : selectedPlan?.price}
                            </span>
                            {selectedPlan?.discounted_price > 0 &&
                              <span className="text-sm line-through text-gray-400 ml-2">
                                {setting?.setting?.currency}{selectedPlan?.price?.toFixed(2)}
                              </span>
                            }
                          </span>
                        </div>
                      </div>
                      <div
                        className={`flex justify-between items-center  bodyBackgroundColor p-3 rounded-md `}
                      >
                        <span className="text-lg font-bold textColor">
                          {t("total_amount")}
                        </span>
                        <span className="text-lg font-bold textColor">{selectedPlan?.discounted_price ? selectedPlan?.discounted_price : selectedPlan?.price}</span>
                      </div>
                    </div>
                  )}
                </>
              </div>
              <div className="flex flex-col gap-3">
                <h1 className="font-bold text-base">
                  {t("choose_payment_method")}
                </h1>
                <div className="flex flex-col gap-2">
                  {type == "subscription" &&
                    <div
                      key={"wallet"}
                      data-method={"wallet"}
                      className={`p-2 flex justify-between items-center  rounded-sm ${selectedPaymentMethod === "wallet"
                        ? "addToCartColor primaryBorder"
                        : "cardBorder"
                        }`}
                      onClick={() => handleSelectedPaymentMethod("wallet")}
                    >
                      <div className="flex gap-2 items-center">
                        <CiWallet size={24} />
                        <p className="font-medium text-base">
                          {t("wallet")}
                        </p>
                      </div>
                      <div>
                        <input
                          id="paymentRadio"
                          type="radio"
                          name="payment_method"
                          className="appearance-none w-6 h-6 mt-[5px] rounded-full outline outline-1 outline-black border-2 border-white cursor-pointer checked:primaryBackColor checked:p-[3px] checked:border-[3px] checked:border-white"
                          checked={selectedPaymentMethod === "wallet"}
                          onChange={() => handleSelectedPaymentMethod("wallet")}
                        />
                      </div>
                    </div>
                  }
                  {enabledPaymentMethods.map((method) => (
                    <div
                      key={method.key}
                      data-method={method.label}
                      className={`p-2 flex justify-between items-center  rounded-sm   ${selectedPaymentMethod === method.label
                        ? "addToCartColor primaryBorder"
                        : "cardBorder"
                        }`}
                      onClick={() => handleSelectedPaymentMethod(method.label)}
                    >
                      <div className="flex gap-2 items-center">
                        <Image
                          src={method.image}
                          className="h-8 w-8"
                          height={32}
                          width={32}
                          unoptimized
                          alt={t(method.label)}
                        />
                        <p className="font-medium text-base dark:text-gray-700">
                          {t(method.label)}
                        </p>
                      </div>
                      <div>
                        <input
                          id="paymentRadio"
                          type="radio"
                          name="payment_method"
                          className="appearance-none w-6 h-6 mt-[5px] rounded-full outline outline-1 outline-black border-2 border-white cursor-pointer checked:primaryBackColor checked:p-[3px] checked:border-[3px] checked:border-white"
                          checked={selectedPaymentMethod === method.label}
                        />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-end">
                    <button
                      className="flex justify-end px-4 py-2 primaryBackColor mt-auto self-end text-white rounded-sm text-xl font-normal"
                      onClick={handleSubmit}
                    >
                      {type == "wallet"
                        ? t("add_money")
                        : t("complete_payment")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <StripeModal
        clientSecret={stripeClientSecret}
        stripeTransId={stripeTransId}
        showStripe={showStripe}
        setShowStripe={setShowStripe}
        amount={amount}
        setWalletModal={setAddWalletModal}
        type={type}
      // subscriptionPlanId={subscriptionPlanId}
      />
    </div>
  );
};

export default WalletBalanceModal;
