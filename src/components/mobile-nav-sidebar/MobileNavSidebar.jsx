import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import React from "react";
import { t } from "@/utils/translation";
import Image from "next/image";
import { LocalizedLink } from "@/utils/localizedNav";
import { useRouter } from "next/router";
import { RiCloseFill } from "react-icons/ri";
import { useSelector } from "react-redux";
import { FaCaretDown } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const MobileNavSidebar = ({ open, setOpen, handleLanguageChange }) => {
  const router = useRouter();
  const setting = useSelector((state) => state?.Setting?.setting);
  const language = useSelector((state) => state.Language);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        className="p-0 w-full sm:w-[900px]"
        side="left"
        aria-describedby={undefined}
      >
        <SheetHeader>
          <SheetTitle className="flex justify-between px-4 py-4 items-center border-b">
            <div className="w-36 h-9 relative">
              <Image
                src={setting?.web_settings?.web_logo}
                alt="mobileLogo"
                fill
                sizes="144px"
                priority
                className="object-contain"
              />
            </div>
            <SheetTrigger className="focus:outline-none closeButtonBg rounded-full p-[8px]">
              <RiCloseFill size={22} />
            </SheetTrigger>
          </SheetTitle>
        </SheetHeader>

        {/* Links Mobile Sidebar */}
        <div>
          <ul className="flex flex-col textColor text-base font-medium">
            <LocalizedLink
              href={"/"}
              className={`p-4 text-start border-b border-dashed ${
                router.pathname === "/" ? "primaryColor" : ""
              }`}
            >
              <li>{t("home")}</li>
            </LocalizedLink>
            <LocalizedLink
              href={"/about-us"}
              className={`p-4 text-start border-b border-dashed ${
                router.pathname === "/about-us" ? "primaryColor" : ""
              }`}
            >
              <li>{t("about_us")}</li>
            </LocalizedLink>
            <LocalizedLink
              href={"/faqs"}
              className={`p-4 text-start border-b border-dashed ${
                router.pathname === "/faqs" ? "primaryColor" : ""
              }`}
            >
              <li> {t("faq")}</li>
            </LocalizedLink>
            <LocalizedLink
              href={"/contact-us"}
              className={`p-4 text-start border-b border-dashed ${
                router.pathname === "/contact-us" ? "primaryColor" : ""
              }`}
            >
              <li>{t("contact_us")}</li>
            </LocalizedLink>
            <LocalizedLink
              href={"/blogs"}
              className={`p-4 text-start border-b border-dashed ${
                router.pathname === "/blogs" ? "primaryColor" : ""
              }`}
            >
              <li>{t("blogs")}</li>
            </LocalizedLink>
          </ul>
        </div>

        {/* Follow Us Mobile Sidebar */}
        {setting?.social_media?.length > 0 && (
          <div className="p-4 flex flex-col gap-2">
            <div className="flex flex-col items-start">{t("follow_us")}</div>
            <div className="flex justify-center ">
              <ul className="flex justify-center gap-1 items-center h-12 w-full backgroundColor">
                {setting?.social_media &&
                  setting?.social_media?.slice(0, 7)?.map?.((social, index) => {
                    return (
                      <React.Fragment key={social?.id}>
                        <LocalizedLink href={social?.link || "#"} target="_blank">
                          {social?.icon.toLowerCase().includes("wechat") ? (
                            <i className="fab fa-weixin"></i>
                          ) : social?.icon.toLowerCase().includes("twitter") ? (
                            <FaXTwitter
                              className={`${social?.icon} text-gray-400`}
                            />
                          ) : (
                            <i className={`${social?.icon} text-gray-400`}></i>
                          )}
                        </LocalizedLink>
                        <span className="border-l border-gray-200 h-6 last:hidden mx-2"></span>
                      </React.Fragment>
                    );
                  })}
              </ul>
            </div>
          </div>
        )}

        {/* Language Mobile Sidebar */}
        <div className="p-4 w-full flex justify-center ">
          <DropdownMenu>
            <DropdownMenuTrigger className="w-full rounded cardBorder border text-base textColor p-4 flex items-center gap-2 group justify-between">
              <div className="font-medium">
                {language?.selectedLanguage
                  ? language?.selectedLanguage?.name
                  : "English"}
              </div>
              <div>
                <FaCaretDown className="transition-transform duration-300 ease-in-out group-data-[state=open]:-rotate-180" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[285px] transition-all duration-300 ease-in-out">
              {language?.availableLanguages &&
                language?.availableLanguages?.map((language) => {
                  return (
                    <DropdownMenuItem
                      key={language?.id}
                      onSelect={() => handleLanguageChange(language)}
                      className="text-base textColor"
                    >
                      {language?.name}
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavSidebar;
