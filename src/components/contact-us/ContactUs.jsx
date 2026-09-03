import React from "react";
import BreadCrumb from "../breadcrumb/BreadCrumb";
import { useSelector } from "react-redux";
import { isEmptyHtml } from "@/lib/utils";
import { t } from "@/utils/translation";
import NoInfoData from "../common/NoInfoData";

const ContactUs = () => {
  const setting = useSelector((state) => state?.Setting?.setting);
  return (
    <section>
      <div>
        <BreadCrumb />
      </div>
      {isEmptyHtml(setting?.contact_us) ? (
        <NoInfoData title={t("contact_us")} />
      ) : (
        <div className="container my-5 bodyBackgroundColor px-1 md:px-0">
          <div
            className="flex flex-col gap-4 rounded p-4 items-center backgroundColor infoContent"
            dangerouslySetInnerHTML={{
              __html: setting?.contact_us,
            }}
          />
        </div>
      )}
    </section>
  );
};

export default ContactUs;
