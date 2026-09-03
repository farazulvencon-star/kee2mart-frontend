import { t } from "@/utils/translation";
import Image from "next/image";
import { LocalizedLink } from "@/utils/localizedNav";
import React from "react";
import { BiMessageAltDots } from "react-icons/bi";
import { IoLocationOutline, IoStorefrontOutline } from "react-icons/io5";
import { FiTruck } from "react-icons/fi";
import { MdPhoneInTalk } from "react-icons/md";
import { useSelector } from "react-redux";

import CashOnDeliveryImage from "@/assets/payment_methods_svgs/ic_cod.svg";
import CashfreeImage from "@/assets/payment_methods_svgs/ic_cashfree.svg";
import RazorpayImage from "@/assets/payment_methods_svgs/ic_razorpay.svg";
import PaypalImage from "@/assets/payment_methods_svgs/ic_paypal.svg";
import PaystackImage from "@/assets/payment_methods_svgs/ic_paystack.svg";
import StriperImage from "@/assets/payment_methods_svgs/ic_stripe.svg";
import MidtransImage from "@/assets/payment_methods_svgs/Midtrans.svg";
import PhonePeImage from "@/assets/payment_methods_svgs/Phonepe.svg";
import PaytabsImage from "@/assets/payment_methods_svgs/ic_paytabs.svg";
import { FaXTwitter } from "react-icons/fa6";

const paymentMethodsConfig = [
  { key: "cod_payment_method", label: "COD", image: CashOnDeliveryImage },
  { key: "razorpay_payment_method", label: "razorpay", image: RazorpayImage },
  { key: "paypal_payment_method", label: "paypal", image: PaypalImage },
  { key: "paystack_payment_method", label: "paystack", image: PaystackImage },
  { key: "stripe_payment_method", label: "stripe", image: StriperImage },
  { key: "cashfree_payment_method", label: "cashfree", image: CashfreeImage },
  { key: "midtrans_payment_method", label: "midtrans", image: MidtransImage },
  { key: "phonepay_payment_method", label: "phonepe", image: PhonePeImage },
  { key: "paytabs_payment_method", label: "paytabs", image: PaytabsImage },
];

const Footer = () => {
  const setting = useSelector((state) => state?.Setting?.setting);
  const paymentSettings = useSelector(
    (state) => state?.Setting?.payment_setting
  );

  const enabledPaymentMethods = paymentMethodsConfig.filter(
    (method) =>
      paymentSettings?.[method.key] && paymentSettings?.[method.key] === "1"
  );

  return (
    <section className="footer">
      <div className="container text-white px-2">
        <div className="md:grid lg:grid lg:grid-cols-12 md:grid-cols-12 flex flex-col items-center py-12 border-b-[1px] gap-3">
          <div className="col-span-6 place-self-start">
            {setting?.web_settings?.app_title !== "" &&
              setting?.web_settings?.app_short_description !== "" && (
                <>
                  <h3 className="font-bold text-2xl">
                    {setting?.web_settings?.app_title !== ""
                      ? setting?.web_settings?.app_title
                      : t("downloadAppsFooter")}
                  </h3>
                  <p className="w-full">
                    {setting?.web_settings?.app_short_description !== ""
                      ? setting?.web_settings?.app_short_description
                      : t("AppsDowloadMsg")}
                  </p>
                </>
              )}
          </div>
          <div className="col-span-6 w-full flex justify-start gap-3 md:justify-end">
            {setting?.web_settings?.is_android_app !== "0" && (
              <LocalizedLink
                href={setting?.web_settings?.android_app_url || "#"}
                target="_blank"
                className="w-[160px]"
              >
                {setting?.web_settings?.play_store_logo && (
                  <Image
                    className="w-full h-full"
                    width={160}
                    height={48}
                    src={setting?.web_settings?.play_store_logo}
                    alt="playStoreLogo"
                    quality={95}
                  />
                )}
              </LocalizedLink>
            )}
            {setting?.web_settings?.is_ios_app !== "0" && (
              <LocalizedLink
                href={setting?.web_settings?.ios_app_url || "#"}
                target="_blank"
                className="w-[160px]"
              >
                {setting?.web_settings?.ios_store_logo && (
                  <Image
                    className="w-full h-full"
                    width={160}
                    height={48}
                    src={setting?.web_settings?.ios_store_logo}
                    alt="appStoreLogo"
                    quality={95}
                  />
                )}
              </LocalizedLink>
            )}
          </div>
        </div>

         <div className="md:grid lg:grid lg:grid-cols-12 md:grid-cols-12 flex flex-col items-center py-12 border-b-[1px] gap-3">
          <div className="col-span-6 place-self-start">
            <h3 className="font-bold text-2xl">{t("join_us")}</h3>
            <p className="w-full">{t("collabration_msg")}</p>
          </div>
          <div className="col-span-6 w-full flex justify-start gap-3 md:justify-end">
            <div className="col-span-3 order-3 justify-end flex   h-full gap-2">
              <LocalizedLink
                href={`${process.env.NEXT_PUBLIC_API_URL}/seller/login`}
                target="__blank"
                className="px-1 md:px-4  flex items-center justify-center font-medium text-white  rounded shadow-sm focus:outline-none primaryBackColor gap-2 text-base"
              >
                <IoStorefrontOutline size={22} />
                {t("seller_registration")}
              </LocalizedLink>
              <LocalizedLink
                href={`${process.env.NEXT_PUBLIC_API_URL}/delivery_boy/login`}
                target="__blank"
                className="p-[10px]   flex items-center justify-center font-medium text-white  rounded shadow-sm focus:outline-none  primaryBackColor gap-2 text-base"
              >
                <FiTruck size={22} />
                {t("deliveryboy_registration")}
              </LocalizedLink>
            </div>
          </div>
        </div>

        <div className="md:grid grid-cols-12 py-12 flex flex-col">
          <div className="col-span-4 flex gap-8 flex-col">
            <h3 className="font-bold text-xl">{t("quick_links")}</h3>
            <ul className=" flex flex-col gap-4">
              <li>
                <LocalizedLink
                  href="/"
                  className="hover:primaryColor hover:border-b border-b-[var(--primary-color)]"
                >
                  {t("home")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/about-us"
                  className="hover:primaryColor hover:border-b border-b-[var(--primary-color)]"
                >
                  {t("about_us")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/contact-us"
                  className="hover:primaryColor hover:border-b border-b-[var(--primary-color)]"
                >
                  {t("contact_us")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/faqs"
                  className="hover:primaryColor hover:border-b border-b-[var(--primary-color)]"
                >
                  {t("faq")}
                </LocalizedLink>
              </li>
              <li>
                <LocalizedLink
                  href="/blogs"
                  className="hover:primaryColor hover:border-b border-b-[var(--primary-color)]"
                >
                  {t("blogs")}
                </LocalizedLink>
              </li>
            </ul>
            {setting?.social_media?.length > 0 && (
              <div className="flex flex-col">
                <p className="font-bold ">{t("follow_us")}</p>
                <div className="flex gap-4 mt-1 iconBackgroundColor p-3 w-fit rounded-[8px] ">
                  {setting?.social_media?.map((social, idx) => {
                    if (social?.icon.toLowerCase().includes("wechat")) {
                      return (
                        <LocalizedLink
                          key={social?.id}
                          href={social?.link || "#"}
                          target="_blank"
                          className="hover:iconsColor"
                        >
                          <i className="fab fa-weixin "></i>
                        </LocalizedLink>
                      );
                    } else if (social?.icon.toLowerCase().includes("twitter")) {
                      return (
                        <LocalizedLink
                          key={social?.id}
                          href={social?.link || "#"}
                          target="_blank"
                          className="hover:iconsColor"
                        >
                          <FaXTwitter className={`${social?.icon} `} />
                        </LocalizedLink>
                      );
                    } else {
                      return (
                        <LocalizedLink
                          key={social?.id}
                          href={social?.link || "#"}
                          target="_blank"
                          className="hover:iconsColor"
                        >
                          <i className={`${social?.icon}`}></i>
                        </LocalizedLink>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="col-span-4 flex gap-8 flex-col  mt-12 md:mt-0">
            {/* Always show every policy link; the page itself shows a
                "no data available" state when its content is empty. */}
            <>
              <h3 className="font-bold text-xl">{t("company_policy")}</h3>
              <ul className="flex flex-col gap-4">
                <li>
                  <LocalizedLink
                    href="/terms-and-conditions"
                    className="hover:primaryColor hover:border-b border-b-[var(--primary-color)]"
                  >
                    {t("terms_and_conditions")}
                  </LocalizedLink>
                </li>
                <li>
                  <LocalizedLink
                    href="/privacy-policy"
                    className="hover:primaryColor hover:border-b border-b-[var(--primary-color)]"
                  >
                    {t("privacy_policy")}
                  </LocalizedLink>
                </li>
                <li>
                  <LocalizedLink
                    href="/return-and-exchange-policy"
                    className="hover:primaryColor hover:border-b border-b-[var(--primary-color)]"
                  >
                    {t("return_and_exchange_policy")}
                  </LocalizedLink>
                </li>
                <li>
                  <LocalizedLink
                    href="/shipping-policy"
                    className="hover:primaryColor hover:border-b border-b-[var(--primary-color)]"
                  >
                    {t("shipping_policy")}
                  </LocalizedLink>
                </li>
                <li>
                  <LocalizedLink
                    href="/cancellation-policy"
                    className="hover:primaryColor hover:border-b border-b-[var(--primary-color)]"
                  >
                    {t("cancellation_policy")}
                  </LocalizedLink>
                </li>
              </ul>
            </>
          </div>
          <div className="col-span-4 flex gap-8 flex-col mt-12 md:mt-0">
            {/* Check Store Info is available and render this part */}
            {setting?.store_address !== "" &&
              setting?.support_email !== "" &&
              setting?.support_number !== "" && (
                <>
                  <h3 className="font-bold text-xl">{t("store_info")}</h3>
                  <div className="flex flex-col gap-6 ">
                    {/* Store Address */}
                    <div className="flex gap-4 items-center">
                      {setting?.store_address !== "" && (
                        <>
                          <span className="p-3 iconBackgroundColor  rounded-[8px]">
                            <IoLocationOutline
                              size={24}
                              className="iconsColor"
                            />
                          </span>
                          <p>
                            <LocalizedLink
                              href={`https://maps.google.com/?q=${setting?.store_address}`}
                              target="_blank"
                            >
                              {setting?.store_address}
                            </LocalizedLink>
                          </p>
                        </>
                      )}
                    </div>

                    {/* Support Email */}
                    <div className="flex gap-4 items-center">
                      {setting?.support_email !== "" && (
                        <>
                          <span className="p-3 iconBackgroundColor  rounded-[8px]">
                            <BiMessageAltDots
                              size={24}
                              className="iconsColor"
                            />
                          </span>
                          <p>
                            <LocalizedLink
                              href={`mailto:${setting?.support_email}`}
                              target="_blank"
                            >
                              {setting?.support_email}
                            </LocalizedLink>
                          </p>
                        </>
                      )}
                    </div>

                    {/* Support Number */}
                    <div className="flex gap-4 items-center">
                      {setting?.support_number !== "" && (
                        <>
                          <span className="p-3 iconBackgroundColor  rounded-[8px]">
                            <MdPhoneInTalk size={24} className="iconsColor" />
                          </span>
                          <p>
                            <LocalizedLink
                              href={`tel:${setting?.support_number}`}
                              target="_blank"
                            >
                              {setting?.support_number}
                            </LocalizedLink>
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </>
              )}
          </div>
        </div>
      </div>
      <div className="bottom-footer bg-black text-white">
        <div className="container md:grid lg:grid-cols-12 py-6 flex flex-col mb-[75px] md:mb-0 gap-6 lg:gap-0">
          <div className="col-span-6 text-center lg:text-left">
            {setting?.web_settings?.copyright_details !== "" &&
              setting?.web_settings?.copyright_details}
          </div>
          <div className="col-span-6 flex flex-col md:flex-row justify-center lg:justify-end items-center gap-3 ">
            {enabledPaymentMethods?.length > 0 && (
              <>
                <p>{t("we_accept")}</p>
                <div className="flex gap-3 justify-between items-center">
                  {enabledPaymentMethods?.length > 0 &&
                    enabledPaymentMethods.slice(0, 4)?.map((method, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 bg-white/[0.24] rounded-sm flex justify-center items-center relative"
                      >
                        <Image
                          src={method?.image}
                          alt={method?.label}
                          fill 
                          className="object-contain"
                          unoptimized={true}
                        />
                      </div>
                    ))}
                  {enabledPaymentMethods?.length > 4 && (
                    <div className="w-8 h-8 bg-white/[0.24] rounded-sm flex justify-center items-center">
                      <p>+{enabledPaymentMethods?.length - 4}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Footer;
