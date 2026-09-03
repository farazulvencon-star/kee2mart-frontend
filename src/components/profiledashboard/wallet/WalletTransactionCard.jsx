import { t } from "@/utils/translation";
import React from "react";
import { formatCustomDate } from "@/lib/utils";
import { useSelector } from "react-redux";

const WalletTransactionCard = ({ transaction }) => {
  const setting = useSelector((state) => state.Setting.setting);
  return (
    <div>
      <div className="border rounded-lg cardBorder">
        {/* Header: Transaction ID and Date */}
        <div className="flex justify-between  text-sm  p-[16px] gap-[16px]">
          <div>
            <p className="SecondaryTextColor text-nowrap text-sm">{t("transaction_id")}</p>
            <p className=" font-bold">{transaction?.id}</p>
          </div>
          <div className="text-left md:text-right">
            <p className="SecondaryTextColor break-words">{t("date")}</p>
            <p className="font-bold">{transaction?.created_at}</p>
          </div>
        </div>

        {/* Message Section */}
        <div className="border-t pt-3  p-4">
          <p className="font-semibold  mb-1">{t("message")}</p>
          <p className="font-bold  leading-snug line-clamp-1">
            {transaction?.message}
          </p>
        </div>

        {/* Transaction Amount Section */}
        <div className="py-3 cardBorder rounded-br-lg rounded-bl-lg flex justify-between items-center backgroundColor p-[16px]">
          <div>
            <p className=" text-sm SecondaryTextColor">
              {t("transaction")} {t("amount")}
            </p>
            <p className="text-xl lg:text-2xl font-bold">
              {setting?.currency}
              {transaction?.amount?.toFixed(
                setting?.decimal_point ? setting?.decimal_point : 0
              )}
            </p>
          </div>
          <div>
            {transaction?.type == "credit" ? (
              <span className="border border-green-500 text-green-500 font-bold text-sm py-1 px-2 rounded">
                {t("credit")}
              </span>
            ) : (
              <span className="border border-red-500 text-red-500 font-bold text-sm py-1 px-2 rounded">
                {t("debit")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletTransactionCard;
