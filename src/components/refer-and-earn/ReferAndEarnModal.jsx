import React, { useState } from "react";
import { IoClose, IoCopy, IoPersonAdd } from "react-icons/io5";
import { FaFacebook, FaTwitter, FaWhatsapp } from "react-icons/fa";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RiCloseFill } from "react-icons/ri";
import ReferAndImage from "@/assets/referandearnimage.svg";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { t } from "@/utils/translation";
import { useSelector } from "react-redux";

const ReferAndEarnModal = ({ showReferAndEarn, setShowReferAndEarn }) => {
  const user = useSelector((state) => state.User.user);
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(user?.referral_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform) => {
    const message = `${t("join_me_message")}: ${user?.referral_code}`;
    const encodedMessage = encodeURIComponent(message);

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodedMessage}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodedMessage}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodedMessage}`, "_blank");
        break;
    }
  };

  return (
    <Dialog open={showReferAndEarn} onOpenChange={setShowReferAndEarn}>
      <DialogContent className="lg:max-w-2xl md:max-w-xl max-w-sm">
        <DialogHeader className="flex items-end">
          <div className="flex closeButtonBg rounded-full p-[8px] gap-[4px] cursor-pointer">
            <RiCloseFill
              size={22}
              onClick={() => setShowReferAndEarn(false)}
              className=""
            />
          </div>
        </DialogHeader>
        <div className="flex item-center flex-col justify-center text-center gap-2 p-4">
          <DialogTitle className="text-2xl font-bold">
            {t("referandearn")}
          </DialogTitle>
          <DialogDescription className="subTextColor leading-relaxed">
            {t("share_message")}
          </DialogDescription>
        </div>

        <div className="space-y-6">
          {/* Illustration */}
          <div className="flex items-center justify-center">
            <div className="w-[190px] h-[150px] md:w-[390px] md:h-[288px] relative">
              <ImageWithPlaceholder
                src={ReferAndImage}
                alt="Refer & Earn image"
                fill
                sizes="(max-width: 768px) 190px, 390px"
                className="object-cover"
                priority
              />
            </div>
          </div>
          {/* Referral Code */}
          <div className="primaryDashedBorder rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 primaryBackColor rounded-lg flex items-center justify-center">
                  <IoPersonAdd size={20} className="fill-white" />
                </div>
                <span className="font-mono text-lg font-semibold textColor">
                  {user?.referral_code}
                </span>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-[#29363F] text-white px-4 py-2 rounded-lg flex items-center space-x-2  transition-colors"
              >
                <IoCopy size={16} />
                <span>{copied ? t("copied") : t("copy_code")}</span>
              </button>
            </div>
          </div>

          {/* OR divider */}
          <div className="flex items-center justify-between my-4 gap-2">
            <hr className="flex-grow border-t-2 border-dashed border-gray-300" />
            <span className=" text-[#4B6272] font-bold text-base">
              {t("or")}
            </span>
            <hr className="flex-grow border-t-2 border-dashed border-gray-300" />
          </div>

          {/* Social sharing buttons */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleShare("facebook")}
              className="bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <FaFacebook size={20} />
              <span>{t("facebook")}</span>
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="bg-gray-900 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-800 transition-colors"
            >
              <FaTwitter size={20} />
              <span>{t("twitter")}</span>
            </button>
            <button
              onClick={() => handleShare("whatsapp")}
              className="bg-green-500 text-white py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-green-600 transition-colors"
            >
              <FaWhatsapp size={20} />
              <span>{t("whatsapp")}</span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReferAndEarnModal;
