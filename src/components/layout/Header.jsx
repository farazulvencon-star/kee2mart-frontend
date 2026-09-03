import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaMoon, FaRegUser, FaSun } from "react-icons/fa";
import * as api from "@/api/apiRoutes";
import {
  IoCartOutline,
  IoLocationOutline,
  IoHomeOutline,
  IoSearchOutline,
  IoLanguage,
  IoChevronDownOutline,
} from "react-icons/io5";
import { LuUser } from "react-icons/lu";
import { FaPhoneVolume, FaXTwitter } from "react-icons/fa6";
import { BiCaretRight } from "react-icons/bi";
import { RxHamburgerMenu } from "react-icons/rx";
import CartDrawer from "../cart/CartDrawer";
// import Login from "../login/Login";
import { t } from "@/utils/translation";
import { useDispatch, useSelector } from "react-redux";
import dynamic from "next/dynamic";
const Location = dynamic(() => import("../locationmodal/Location"), {
  ssr: false,
});
const Login = dynamic(() => import("../login/Login"), {
  ssr: false,
});
// const CartDrawer = dynamic(() => import("../cart/CartDrawer"), {
//   ssr: false,
// });
const LogoutModal = dynamic(() => import("../logoutmodal/LogoutModal"), {
  ssr: false,
});
const ProfileDrawer = dynamic(
  () => import("../profiledashboard/ProfileDrawer"),
  {
    ssr: false,
  },
);
const MobileNavSidebar = dynamic(
  () => import("../mobile-nav-sidebar/MobileNavSidebar"),
  {
    ssr: false,
  },
);
import {
  BiBell,
  BiBookmarkHeart,
  BiCartAlt,
  BiUserCircle,
  BiWallet,
  BiCart,
} from "react-icons/bi";
import { RiLogoutCircleRLine } from "react-icons/ri";
import { LuMapPin } from "react-icons/lu";
import { LocalizedLink } from "@/utils/localizedNav";
import { useRouter } from "next/router";
import { setCity } from "@/redux/slices/citySlice";
import { setLocalTheme } from "@/redux/slices/themeSlice";
import { useTheme } from "next-themes";
// import LogoutModal from "../logoutmodal/LogoutModal";
// import ProfileDrawer from "../profiledashboard/ProfileDrawer";
import { clearCheckout } from "@/redux/slices/checkoutSlice";
import {
  setFilterSearch,
  setProductBySearch,
  setSearchedCategory,
} from "@/redux/slices/productFilterSlice";
import SearchComponent from "../search/SearchComponent";
import ModuleButton from "../module-button/ModuleButton";
import { setModules, setActiveModule } from "@/redux/slices/moduleSlice";
import { store } from "@/redux/store";
import GroceryIcon from "../module-button/GroceryIcon";
import PharmacyIcon from "../module-button/PharmacyIcon";
import { useMediaQuery } from "react-responsive";
import { RiCloseFill } from "react-icons/ri";
import { setSelectedLanguage } from "@/redux/slices/languageSlice";
import Image from "next/image";
// import MobileNavSidebar from "../mobile-nav-sidebar/MobileNavSidebar";

import { CiSun } from "react-icons/ci";
import { FiMoon } from "react-icons/fi";

const Header = () => {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const dispatch = useDispatch();

  const themes = useSelector((state) => state.Theme);
  const cart = useSelector((state) => state.Cart);
  const setting = useSelector((state) => state.Setting);
  const user = useSelector((state) => state.User);
  const city = useSelector((state) => state.City);
  const filter = useSelector((state) => state.ProductFilter);
  const language = useSelector((state) => state.Language);
  const fcmToken = useSelector((state) => state.User?.fcm_token);

  // Device Width Checking
  const isMobile = useMediaQuery({ query: "(max-width: 765px)" });

  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [mobileActiveKey, setMobileActiveKey] = useState(1);
  const [selectedTab, setSelectedTab] = useState("profile");
  const [showProfile, setShowProfile] = useState(false);

  const [showLocation, setShowLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  const [mobileSearch, setMobileSearch] = useState(false);
  const [searchCatId, setSearchCatId] = useState("");
  const [typingTimeout, setTypingTimeout] = useState(null);
  const [isSuggLoading, setIsSuggLoading] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const modules = useSelector((state) => state.Module.modules);
  const activeModuleId = useSelector((state) => state.Module.activeModuleId);
  const moduleGuestItems = (cart?.guestCart || []).filter(
    (i) => i.module_id == activeModuleId
  );
  const guestCount = moduleGuestItems.length;
  const guestTotal = moduleGuestItems.reduce(
    (s, i) => s + (Number(i.productPrice) || 0) * (Number(i.qty) || 0),
    0
  );

  useEffect(() => {
    if (router?.pathname !== "/products") {
      dispatch(setFilterSearch({ data: "" }));
    }
  }, []);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      const res = await api.getModules();
      const list = res?.data || [];
      dispatch(setModules({ data: list }));
      // Read the CURRENT module (the URL reader may have set it from a shared
      // link while getModules was in flight) so we don't clobber it.
      const current = store.getState()?.Module?.activeModuleId;
      if (list.length && !current) {
        dispatch(setActiveModule({ data: list[0].id }));
      }
    } catch (error) {
      console.log("modules error", error);
    }
  };

  useEffect(() => {
    if (router?.pathname != "/checkout") {
      dispatch(clearCheckout());
    }
  }, [router]);

  useEffect(() => {
    // if mobile screen is dragged to desktop screen close the mobile search
    if (isMobile === false && mobileSearch === true) {
      setMobileSearch(false);
    }
  }, [isMobile]);
  useEffect(() => {
    fetchCity();
  }, [setting]);
  useEffect(() => {
    if (router.pathname.includes("/profile")) {
      setMobileActiveKey(3);
    }
  }, [router.pathname]);

  const handleChangeTheme = (theme) => {
    setTheme(theme);
    dispatch(setLocalTheme({ data: theme }));
  };

  const handleLanguageChange = async (language) => {
    if (language?.code === router.query.lang) return;
    try {
      const response = await api.getSystemLanguages({
        id: language?.id,
        isDefault: 0,
        systemType: 3,
      });
      if (response.status == 1) {
        dispatch(setSelectedLanguage({ data: language?.data }));
        // document.documentElement.dir = response?.data?.type;

        // Keep URL in sync when language is changed via dropdown
        router.replace({
          pathname: router.pathname,
          query: { ...router.query, lang: response?.data?.code },
        });

        await api.updateFcmToken({
          langaugeId: response?.data?.admin_lang_id_for_fcm,
          fcmToken,
        });
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchCity = async () => {
    try {
      if (setting?.setting?.default_city && city?.city == null) {
        const latitude = parseFloat(setting.setting.default_city?.latitude);
        const longitude = parseFloat(setting.setting.default_city?.longitude);
        const response = await api.getCity({
          latitude: latitude,
          longitude: longitude,
        });
        if (response.status === 1) {
          dispatch(setCity({ data: response.data }));
        } else {
          setShowLocation(true);
        }
      } else if (
        setting?.setting &&
        setting.setting?.default_city == null &&
        city?.city == null
      ) {
        setShowLocation(true);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleCartOpen = () => {
    if (router.pathname == "/checkout") {
      router.push("/cart");
    } else {
      setShowCart(true);
    }
  };

  const handleLoginOpen = () => {
    setShowLogin(true);
  };

  const handleOpenLocation = () => {
    setShowLocation(true);
  };

  const handleHomeClick = () => {
    setMobileActiveKey(1);
    router.push("/");
  };

  const handleProfileClick = () => {
    setMobileActiveKey(3);
    if (user?.jwtToken) {
      setShowProfile(true);
    } else {
      setShowLogin(true);
    }
  };

  const handleSearchCategory = (value) => {
    setSearchCatId(value);
    dispatch(setSearchedCategory({ data: value }));
  };

  const handleSearchData = async (searchValue) => {
    setIsSuggLoading(true);
    try {
      const response = await api.getProductByFilter({
        latitude: city?.city?.latitude,
        longitude: city?.city?.longitude,
        filters: {
          search: searchValue,
          category_id: filter?.searchedCategory,
        },
      });
      dispatch(setProductBySearch({ data: response?.data }));
      setIsSuggLoading(false);
    } catch (error) {
      console.log("Error", error?.message);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    if (value.trim() === "") {
      dispatch(setProductBySearch({ data: [] }));
      dispatch(setFilterSearch({ data: "" }));
      clearTimeout(typingTimeout);
      return;
    }
    setIsSuggLoading(true);
    dispatch(setFilterSearch({ data: e.target.value }));
    dispatch(setSearchedCategory({ data: searchCatId }));
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    const timeout = setTimeout(() => {
      handleSearchData(e.target.value);
    }, 2000);
    setTypingTimeout(timeout);
  };

  const handleMobileSearch = () => {
    setMobileSearch(!mobileSearch);
  };

  const handleMobileNav = () => {
    setMobileNav(!mobileNav);
  };

  return (
    <>
      <section className="border-b-2">
        <div className="w-full primaryBackColor top-header text-white  md:block hidden">
          <div className="container flex justify-center items-center h-[40px] px-2">
            <div className="flex gap-6 text-xs font-semibold uppercase whitespace-nowrap items-center">
              <LocalizedLink href="/" className="hover:text-gray-200 transition-colors">SAVE MORE ON APP</LocalizedLink>
              <LocalizedLink href="/" className="hover:text-gray-200 transition-colors">BECOME A SELLER</LocalizedLink>
              <LocalizedLink href="/" className="hover:text-gray-200 transition-colors">HELP & SUPPORT</LocalizedLink>
              {user?.jwtToken === "" && (
                <>
                  <LocalizedLink href="/login" className="hover:text-gray-200 transition-colors">LOGIN</LocalizedLink>
                  <LocalizedLink href="/" className="hover:text-gray-200 transition-colors">SIGN UP</LocalizedLink>
                </>
              )}
              
              {/* Language Selector */}
              <DropdownMenu>
                {language?.availableLanguages?.length > 1 ? (
                  <DropdownMenuTrigger className="border-none flex items-center gap-1 justify-center hover:text-gray-200 transition-colors">
                    <IoLanguage size={14} />{" "}
                    {language?.selectedLanguage
                      ? language?.selectedLanguage?.name
                      : "English"}
                  </DropdownMenuTrigger>
                ) : (
                  <button className="border-none flex items-center gap-1 justify-center hover:text-gray-200 transition-colors">
                    <IoLanguage size={14} />{" "}
                    {language?.selectedLanguage
                      ? language?.selectedLanguage?.name
                      : "English"}
                  </button>
                )}

                <DropdownMenuContent className="w-[100px] ">
                  {language?.availableLanguages &&
                    language?.availableLanguages?.map((language) => {
                      return (
                        <DropdownMenuItem
                          onSelect={() => handleLanguageChange(language)}
                          key={language?.id}
                          className="flex gap-2"
                        >
                          {language?.name}
                        </DropdownMenuItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
        <div className="primaryBackColor pb-0 md:pb-3 relative shadow-sm text-white">
          <div className="center-header container">
            <div className="px-2 flex justify-between items-center pb-[8px] md:py-[12px] lg:py-4 gap-4 md:gap-8 border-b-2 md:border-none py-2">
              <div className="  relative order-2 lg:order-1 h-[38px] lg:h-[45px] w-[140px] lg:w-[170px]">
                <LocalizedLink href={"/"} className="relative block w-full h-full">
                  <Image
                    src={setting?.setting?.web_settings?.web_logo || "/kee2mart-logo.png"}
                    alt="Logo"
                    fill
                    priority={true}
                    fetchpriority="high"
                    loading="eager"
                    className="object-contain mix-blend-multiply"
                  />
                </LocalizedLink>
              </div>
              
              {/* Desktop Location Block */}
              <div
                className="hidden lg:flex gap-2 items-center cursor-pointer order-2 shrink-0 ml-4 mr-4"
                onClick={handleOpenLocation}
              >
                <span className="p-2 bg-white/20 rounded-full shrink-0">
                  <IoLocationOutline size={22} className="text-white" />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="flex items-center gap-1 text-white/90">
                    <span className="text-xs">
                      {t("deliver_to")}
                    </span>
                    <IoChevronDownOutline size={10} />
                  </span>
                  <span className="text-sm font-semibold line-clamp-1 max-w-48 text-white">
                    <>
                      {city.status === "fulfill" ? (
                        city?.city?.formatted_address
                      ) : (
                        <div className="d-flex justify-content-center">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">
                              {t("loading")}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  </span>
                </div>
              </div>

              <div className="hidden lg:flex flex-1 w-full order-2">
                <SearchComponent
                  isSuggLoading={isSuggLoading}
                  isMobile={isMobile}
                  handleSearchCategory={handleSearchCategory}
                  handleSearch={handleSearch}
                />
              </div>
              <div className="flex sm:order-1 md:order-1 lg:hidden hover:cursor-pointer">
                <RxHamburgerMenu size={21} onClick={handleMobileNav} />
              </div>
              <div className=" gap-4 order-3 hidden md:flex lg:flex ">
                <div className="flex items-center gap-4 cursor-pointer">
                  {/* Notifications */}
                  <span className="p-3 bg-white/20 rounded-full relative hover:bg-white/30 transition-colors">
                    <BiBell size={26} className="text-white" />
                  </span>

                  {/* User Profile */}
                  <span className="p-3 bg-white/20 rounded-full relative hover:bg-white/30 transition-colors" onClick={() => user?.jwtToken === "" ? handleLoginOpen() : null}>
                    <FaRegUser size={26} className="text-white" />
                  </span>
                  
                  {/* Wishlist/Bookmark */}
                  <span className="p-3 bg-white/20 rounded-full relative hover:bg-white/30 transition-colors">
                    <BiBookmarkHeart size={28} className="text-white" />
                  </span>

                  {/* Cart */}
                  <span className="p-3 bg-white/20 rounded-full relative hover:bg-white/30 transition-colors" onClick={handleCartOpen}>
                    <BiCart size={28} className="text-white" />
                    {cart.isGuest == true ? (
                      <p
                        className={
                          guestCount != 0
                            ? "flex absolute top-[-7px] right-0  bodyTextColor textBackground rounded-full h-[20px] w-[20px] items-center justify-center text-center font-bold text-sm"
                            : "none"
                        }
                      >
                        {" "}
                        {guestCount != 0
                          ? guestCount
                          : null}
                      </p>
                    ) : (
                      <p
                        className={
                          cart?.cartProducts?.length != 0
                            ? "flex absolute bodyTextColor top-[-7px] right-0 textBackground rounded-full text-center h-5 w-5 items-center justify-center p-1 font-bold text-sm"
                            : "none"
                        }
                      >
                        {" "}
                        {cart?.cartProducts?.length != 0
                          ? cart?.cartProducts?.length
                          : null}
                      </p>
                    )}
                  </span>
                  <div className="flex flex-col hidden">
                    <span className="text-sm">{t("your_cart")}</span>
                    <span className="text-base font-bold">
                      {setting.setting && setting.setting.currency}
                      {cart.isGuest == true
                        ? guestTotal?.toFixed(
                            setting?.setting?.decimal_point
                              ? setting?.setting?.decimal_point
                              : 0,
                          )
                        : cart?.cartSubTotal?.toFixed(
                            setting?.setting?.decimal_point
                              ? setting?.setting?.decimal_point
                              : 0,
                          )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex md:hidden gap-2 order-3 items-center">
                <div>
                  {themes?.theme == "light" ? (
                    <CiSun
                      onClick={() => handleChangeTheme("dark")}
                      size={24}
                    />
                  ) : (
                    <FiMoon
                      onClick={() => handleChangeTheme("light")}
                      size={24}
                    />
                  )}
                </div>
                <div onClick={handleCartOpen} className="relative">
                  <IoCartOutline size={24} />{" "}
                  {cart.isGuest == true ? (
                    <p
                      className={
                        guestCount != 0
                          ? "flex absolute  bottom-4 left-4  bodyTextColor textBackground rounded-full h-[18px] w-[18px] items-center justify-center text-center font-semibold text-xs"
                          : "none"
                      }
                    >
                      {" "}
                      {guestCount != 0
                        ? guestCount
                        : null}
                    </p>
                  ) : (
                    <p
                      className={
                        cart?.cartProducts?.length != 0
                          ? "flex absolute bodyTextColor bottom-4 left-4   textBackground rounded-full text-center h-4 w-4 items-center justify-center p-1 font-bold text-sm"
                          : "none"
                      }
                    >
                      {" "}
                      {cart?.cartProducts?.length != 0
                        ? cart?.cartProducts?.length
                        : null}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bottom-header ">
            <div className="container mx-auto flex md:hidden justify-between mt-2 mb-2 px-2">
              {/* Mobile Location Block */}
              <div
                className="flex gap-2 items-center cursor-pointer"
                onClick={handleOpenLocation}
              >
                <span className="p-2 bg-white/20 rounded-full shrink-0">
                  <IoLocationOutline size={24} className="text-white" />
                </span>
                <div className="flex flex-col min-w-0">
                  <span className="flex items-center gap-1.5 text-white/90">
                    <span className="text-sm">
                      {t("deliver_to")}
                    </span>
                    <IoChevronDownOutline size={12} />
                  </span>
                  <span className="text-base font-medium line-clamp-1 text-white">
                    <>
                      {city.status === "fulfill" ? (
                        city?.city?.formatted_address
                      ) : (
                        <div className="d-flex justify-content-center">
                          <div className="spinner-border" role="status">
                            <span className="visually-hidden">
                              {t("loading")}
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  </span>
                </div>
              </div>
            </div>
            {/* Mobile/Tablet inline search bar */}
            <div className="block lg:hidden container mx-auto px-2 mb-2">
              <SearchComponent
                isSuggLoading={isSuggLoading}
                isMobile={isMobile}
                handleSearchCategory={handleSearchCategory}
                handleSearch={handleSearch}
              />
            </div>
          </div>
        </div>
        <Sheet open={mobileSearch} onOpenChange={setMobileSearch}>
          <SheetContent
            className="p-0 w-full sm:w-[900px]"
            side={language?.selectedLanguage?.type == "RTL" ? "left" : "right"}
          >
            <SheetHeader>
              <SheetTitle className="flex justify-between px-4 py-2 items-center">
                {t("search")}
                <SheetTrigger className="focus:outline-none closeButtonBg rounded-full p-[8px] gap-[4px] cursor-pointer">
                  <RiCloseFill size={22} />
                </SheetTrigger>
              </SheetTitle>
              <SheetDescription>
                <SearchComponent
                  isSuggLoading={isSuggLoading}
                  isMobile={isMobile}
                  mobileSearch={mobileSearch}
                  setMobileSearch={setMobileSearch}
                  handleSearch={handleSearch}
                  handleSearchCategory={handleSearchCategory}
                />
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
        <MobileNavSidebar
          open={mobileNav}
          setOpen={setMobileNav}
          handleLanguageChange={handleLanguageChange}
        />
        <CartDrawer
          showCart={showCart}
          setShowCart={setShowCart}
          setMobileActiveKey={setMobileActiveKey}
        />
        <Login
          showLogin={showLogin}
          setShowLogin={setShowLogin}
          setMobileActiveKey={setMobileActiveKey}
        />
        {showLocation && (
          <Location
            showLocation={showLocation}
            setShowLocation={setShowLocation}
          />
        )}
        <LogoutModal showLogout={showLogout} setShowLogout={setShowLogout} />
      </section>
      <section className="fixed bottom-0 left-0 w-full z-50 md:hidden backgroundColor pt-3">
        <div className="container flex items-center justify-center px-2 ">
          <div className="flex  justify-between gap-16">
            <div
              className={`flex flex-col items-center gap-1`}
              onClick={handleHomeClick}
            >
              <IoHomeOutline
                size={24}
                className={`h-10 w-10 ${
                  mobileActiveKey == 1
                    ? "primaryBackColor text-white  "
                    : "bg-[#55AE7B14] primaryColor "
                }p-2 rounded-full`}
              />
              <span className="text-sm">{t("home")}</span>
            </div>

            <div
              className={`flex flex-col items-center gap-1`}
              onClick={handleMobileSearch}
            >
              <IoSearchOutline
                size={24}
                className={`h-10 w-10 ${
                  mobileActiveKey == 2
                    ? "primaryBackColor text-white "
                    : "bg-[#55AE7B14] primaryColor "
                } p-2 rounded-full`}
              />
              <span className="text-sm">{t("search")}</span>
            </div>

            <div
              className={`flex flex-col items-center gap-1`}
              onClick={handleProfileClick}
            >
              <FaRegUser
                size={24}
                className={`h-10 w-10 ${
                  mobileActiveKey == 3
                    ? "primaryBackColor text-white "
                    : "bg-[#55AE7B14] primaryColor "
                } p-2 rounded-full`}
              />
              <span className="text-sm">
                {user?.jwtToken ? t("profile") : t("login")}
              </span>
            </div>
          </div>
        </div>
      </section>
      <ProfileDrawer
        showProfile={showProfile}
        setShowProfile={setShowProfile}
        setSelectedTab={setSelectedTab}
        selectedTab={selectedTab}
      />
    </>
  );
};

export default Header;
