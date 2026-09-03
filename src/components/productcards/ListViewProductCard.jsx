import React, { useEffect, useState } from "react";
import { t } from "@/utils/translation";
import {
  FaMinus,
  FaPlus,
  FaRegEye,
  FaShoppingBasket,
  FaStar,
} from "react-icons/fa";
import { LocalizedLink } from "@/utils/localizedNav";
import { formatPriceDisplay } from "@/lib/utils";
import { MdArrowDropDown } from "react-icons/md";
import VariantsModal from "../variantsmodal/VariantsModal";
import ProductDetailModal from "../productdetailmodal/ProductDetailModal";
import { useDispatch, useSelector } from "react-redux";
import {
  addGuestCartTotal,
  addtoGuestCart,
  setCart,
  setCartProducts,
  setCartSubTotal,
  subGuestCartTotal,
} from "@/redux/slices/cartSlice";
import * as api from "@/api/apiRoutes";
import { toast } from "react-toastify";
import { setFavoriteProductIds } from "@/redux/slices/FavoriteSlice";
import { BiHeart, BiSolidHeart } from "react-icons/bi";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import SingleSellerConfirmationModal from "../single-seller-confirmation-modal/SingleSellerConfirmationModal";

const ListViewProductCard = ({ product }) => {
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.Cart);
  const activeModuleId = useSelector((state) => state.Module.activeModuleId);
  const setting = useSelector((state) => state.Setting.setting);
  const user = useSelector((state) => state.User);
  const favoriteProducts = useSelector(
    (state) => state.Favorite.favouriteProductIds
  );

  const [selectedVariant, setSelectedVariant] = useState([]);
  const [showVariants, setShowVariants] = useState(false);
  const [showProductDetail, setShowProductDetail] = useState(false);
  const [showSingleSellerModal, setSingleSellerModal] = useState(false);

  useEffect(() => {
    const inStockVariant = product?.variants?.find(
      (variant) => variant?.is_unlimited_stock === 0 && variant?.stock > 0
    );
    if (inStockVariant == undefined) {
      setSelectedVariant(product?.variants[0]);
    } else {
      setSelectedVariant(inStockVariant);
    }
  }, [product]);

  const calculateDiscount = (discountPrice, actualPrice) => {
    const difference = actualPrice - discountPrice;
    const actualDiscountPrice = difference / actualPrice;
    return actualDiscountPrice * 100;
  };

  const getProductQuantities = (products) => {
    return Object.entries(
      products?.reduce((quantities, product) => {
        const existingQty = quantities[product.product_id] || 0;
        return {
          ...quantities,
          [product.product_id]: existingQty + product.qty,
        };
      }, {})
    ).map(([productId, qty]) => ({
      product_id: parseInt(productId),
      qty,
    }));
  };

  // cart functionality
  const addToCart = async (productId, productVId, qty) => {
    try {
      const response = await api.addToCart({
        product_id: productId,
        product_variant_id: productVId,
        qty: qty,
      });
      if (response.status === 1) {
        if (
          cart?.cartProducts?.find(
            (product) =>
              product?.product_id == productId &&
              product?.product_variant_id == productVId
          )?.qty == undefined
        ) {
          dispatch(setCart({ data: response }));
          const updatedCartCount = [
            ...cart?.cartProducts,
            { product_id: productId, product_variant_id: productVId, qty: qty },
          ];
          dispatch(setCartProducts({ data: updatedCartCount }));
          dispatch(setCartSubTotal({ data: response?.sub_total }));
        } else {
          const updatedProducts = cart?.cartProducts?.map((product) => {
            if (
              product.product_id == productId &&
              product?.product_variant_id == productVId
            ) {
              return { ...product, qty: qty };
            } else {
              return product;
            }
          });
          dispatch(setCart({ data: response }));
          dispatch(setCartProducts({ data: updatedProducts }));
          dispatch(setCartSubTotal({ data: response?.sub_total }));
        }
      } else if (response?.data?.one_seller_error_code == 1) {
        setSingleSellerModal(true);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const removeFromCart = async (productId, variantId) => {
    try {
      const response = await api.removeFromCart({
        product_id: productId,
        product_variant_id: variantId,
      });
      if (response?.status === 1) {
        const updatedProducts = cart?.cartProducts?.filter(
          (product) =>
            product?.product_id != productId &&
            product?.product_variant_id != variantId
        );
        dispatch(setCartSubTotal({ data: response?.sub_total }));
        dispatch(setCartProducts({ data: updatedProducts }));
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  const AddToGuestCart = (
    product,
    productId,
    productVariantId,
    Qty,
    isExisting,
    flag
  ) => {
    const finalPrice =
      selectedVariant?.discounted_price !== 0
        ? selectedVariant?.discounted_price
        : selectedVariant?.price;
    if (isExisting) {
      let updatedProducts;
      if (Qty !== 0) {
        if (flag == "add") {
          dispatch(addGuestCartTotal({ data: finalPrice }));
        } else if (flag == "remove") {
          dispatch(subGuestCartTotal({ data: finalPrice }));
        }
        updatedProducts = cart?.guestCart?.map((product) => {
          if (
            product?.product_id == productId &&
            product?.product_variant_id == productVariantId
          ) {
            return { ...product, qty: Qty };
          } else {
            // dispatch(addGuestCartTotal({ data: finalPrice }));
            return product;
          }
        });
      } else {
        if (flag == "add") {
          dispatch(addGuestCartTotal({ data: finalPrice }));
        } else if (flag == "remove") {
          dispatch(subGuestCartTotal({ data: finalPrice }));
        }
        updatedProducts = cart?.guestCart?.filter(
          (product) =>
            product?.product_id != productId &&
            product?.product_variant_id != productVariantId
        );
      }
      dispatch(addtoGuestCart({ data: updatedProducts }));
    } else {
      if (flag == "add") {
        dispatch(addGuestCartTotal({ data: finalPrice }));
      } else if (flag == "remove") {
        dispatch(subGuestCartTotal({ data: finalPrice }));
      }
      // dispatch(addGuestCartTotal({ data: finalPrice }))
      const productData = {
        product_id: productId,
        product_variant_id: productVariantId,
        qty: Qty,
        productPrice: finalPrice,
        module_id: activeModuleId,
      };
      dispatch(addtoGuestCart({ data: [...cart?.guestCart, productData] }));
    }
  };
  const handleValidateAddExistingGuestProduct = (
    productQuantity,
    product,
    quantity
  ) => {
    const productQty = productQuantity?.find(
      (prdct) => prdct?.product_id == product?.id
    )?.qty;

    if (Number(product.is_unlimited_stock !== 0)) {
      if (productQty >= Number(product?.total_allowed_quantity)) {
        toast.error(t("max_cart_limit_error"));
      } else {
        AddToGuestCart(
          product,
          product?.id,
          selectedVariant?.id,
          quantity,
          1,
          "add"
        );
      }
    } else {
      if (productQty >= Number(selectedVariant?.stock)) {
        toast.error(t("out_of_stock_message"));
      } else if (productQty >= Number(product?.total_allowed_quantity)) {
        toast.error(t("max_cart_limit_error"));
      } else {
        AddToGuestCart(
          product,
          product?.id,
          selectedVariant?.id,
          quantity,
          1,
          "add"
        );
      }
    }
  };
  const handleAddNewProductGuest = (productQuantity, product) => {
    const productQty = productQuantity?.find(
      (prdct) => prdct?.product_id == product?.id
    )?.qty;
    if (
      selectedVariant?.is_unlimited_stock == 0 &&
      selectedVariant?.stock == 0
    ) {
      toast.error(t("out_of_stock_message"));
    } else if (
      Number(productQty || 0) < Number(product.total_allowed_quantity)
    ) {
      AddToGuestCart(product, product.id, selectedVariant?.id, 1, 0, "add");
    } else {
      toast.error(t("out_of_stock_message"));
    }
  };
  const handleValidateAddNewProduct = (productQuantity, product) => {
    const productQty = productQuantity?.find(
      (prdct) => prdct?.product_id == product?.id
    )?.qty;

    if ((productQty || 0) >= Number(product?.total_allowed_quantity)) {
      toast.error(t("out_of_stock_message"));
    } else if (cart?.cartProducts?.length >= setting?.max_cart_items_count) {
      toast.error(t("maximum_cart_quantity_reach"));
    } else if (Number(product.is_unlimited_stock)) {
      addToCart(product.id, selectedVariant.id, 1);
    } else {
      if (selectedVariant?.status) {
        addToCart(product.id, selectedVariant?.id, 1);
      } else {
        toast.error(t("out_of_stock_message"));
      }
    }
  };
  const handleIntialAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cart?.isGuest) {
      const quantity = getProductQuantities(cart?.cartProducts);
      handleAddNewProductGuest(quantity, product);
    } else {
      const quantity = getProductQuantities(cart?.cartProducts);
      handleValidateAddNewProduct(quantity, product);
    }
  };
  const handleValidateAddExistingProduct = (productQuantity, product) => {
    const productQty = productQuantity?.find(
      (prdct) => prdct?.product_id == product?.id
    )?.qty;
    if (Number(product.is_unlimited_stock)) {
      if (productQty < Number(product?.total_allowed_quantity)) {
        addToCart(
          product.id,
          selectedVariant?.id,
          cart?.cartProducts?.find(
            (prdct) => prdct?.product_variant_id == selectedVariant?.id
          )?.qty + 1
        );
      } else {
        toast.error(t("max_cart_limit_error"));
      }
    } else {
      if (productQty >= Number(selectedVariant.stock)) {
        toast.error(t("out_of_stock_message"));
      } else if (Number(productQty) >= Number(product.total_allowed_quantity)) {
        toast.error(t("max_cart_limit_error"));
      } else {
        addToCart(
          product.id,
          selectedVariant?.id,
          cart?.cartProducts?.find(
            (prdct) => prdct?.product_variant_id == selectedVariant?.id
          )?.qty + 1
        );
      }
    }
  };
  const handleQuantityIncrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cart?.isGuest) {
      const productQuantity = getProductQuantities(cart?.guestCart);
      handleValidateAddExistingGuestProduct(
        productQuantity,
        product,
        cart?.guestCart?.find(
          (prdct) =>
            prdct?.product_id == product?.id &&
            prdct?.product_variant_id == selectedVariant?.id
        )?.qty + 1
      );
    } else {
      const quantity = getProductQuantities(cart?.cartProducts);
      handleValidateAddExistingProduct(quantity, product);
    }
  };
  const handleQuantityDecrease = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (cart?.isGuest) {
      AddToGuestCart(
        product,
        product?.id,
        selectedVariant?.id,
        cart?.guestCart?.find(
          (prdct) => prdct?.product_variant_id == selectedVariant?.id
        )?.qty - 1,
        1,
        "remove"
      );
    } else {
      if (
        cart?.cartProducts?.find(
          (prdct) => prdct?.product_variant_id == selectedVariant?.id
        ).qty == 1
      ) {
        removeFromCart(product?.id, selectedVariant?.id);
      } else {
        addToCart(
          product.id,
          selectedVariant.id,
          cart?.cartProducts?.find(
            (prdct) => prdct?.product_variant_id == selectedVariant?.id
          )?.qty - 1
        );
      }
    }
  };
  const handleShowVariantModal = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.variants.length > 1) {
      setShowVariants(true);
    } else {
      return;
    }
  };
  const handleShowDetailModal = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowProductDetail(true);
  };

  const handleProductLikes = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const isAlreadyLikes = favoriteProducts?.includes(product?.id);
    try {
      if (user?.jwtToken) {
        if (!isAlreadyLikes) {
          const response = await api.addToFavorite({ product_id: product?.id });
          if (response.status == 1) {
            const updatedFavProducts = [...favoriteProducts, product?.id];
            dispatch(setFavoriteProductIds({ data: updatedFavProducts }));
            toast.success(response.message);
          } else {
            toast.error(response.message);
          }
        } else {
          const response = await api.removeFromFavorite({
            product_id: product?.id,
          });
          if (response.status == 1) {
            const updatedFavProducts = favoriteProducts?.filter(
              (prdctId) => prdctId != product?.id
            );
            dispatch(setFavoriteProductIds({ data: updatedFavProducts }));
            toast.success(response.message);
          } else {
            toast.error(response.message);
          }
        }
      } else {
        toast.error(t("required_login_message_for_wishlist"));
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const productsVariants = product.variants;

  const isProductAlreadyAdded =
    (cart?.isGuest === false &&
      cart?.cartProducts?.find(
        (prdct) => prdct?.product_variant_id == selectedVariant?.id
      )?.qty > 0) ||
    (cart?.isGuest === true &&
      cart?.guestCart?.find(
        (prdct) => prdct?.product_variant_id === selectedVariant?.id
      )?.qty > 0);

  const addedQuantity =
    cart.isGuest === false
      ? cart?.cartProducts?.find(
        (prdct) => prdct?.product_variant_id == selectedVariant?.id
      )?.qty
      : cart?.guestCart?.find(
        (prdct) => prdct?.product_variant_id == selectedVariant?.id
      )?.qty;

  const isProductAvailabel =
    (product?.variants?.length <= 1 &&
      product?.variants?.[0]?.is_unlimited_stock == 0 &&
      product?.variants?.[0]?.stock == 0) ||
    (selectedVariant?.stock <= 0 && selectedVariant?.is_unlimited_stock == 0) ||
    selectedVariant?.status == 0 ||
    product?.status == 0;

  return (
    <div className="h-full">
      <LocalizedLink
        href={`/product/${product?.slug}`}
        className="flex h-full bg-white rounded-2xl border border-zinc-200 overflow-hidden group headerBackgroundColor textColor"
      >
        {/* Left: info */}
        <div className="flex-1 min-w-0 p-4 flex flex-col gap-2">
          {/* rating + variant */}
          <div className="flex items-center gap-2">
            {product?.average_rating > 0 && product?.product_rating == true ? (
              <>
                <div className="flex items-center gap-1">
                  <FaStar size={16} className="text-amber-400" />
                  <span className="textColor text-xs font-medium">
                    {product?.average_rating}
                  </span>
                </div>
                <span className="h-4 w-px bg-zinc-900/10" />
              </>
            ) : null}
            <span className="textColor text-xs font-semibold">
              {`${selectedVariant?.measurement} ${selectedVariant?.unit?.translations?.short_code ?? selectedVariant?.unit?.short_code}`}
            </span>
          </div>

          {/* title + price */}
          <div className="flex flex-col gap-1">
            <h3 className="textColor text-xl font-bold leading-6 line-clamp-2 min-h-[3rem] capitalize group-hover:primaryColor">
              {product?.translations?.name ?? product?.name}
            </h3>
            {!isProductAvailabel ? (
              <div className="flex items-center gap-2">
                {selectedVariant?.discounted_price !== 0 &&
                selectedVariant?.discounted_price !== selectedVariant?.price ? (
                  <>
                    <span className="textColor text-base font-medium leading-6">
                      {setting?.currency}
                      {formatPriceDisplay(selectedVariant?.discounted_price)}
                    </span>
                    <span className="opacity-40 textColor text-sm font-bold leading-4 line-through">
                      {setting?.currency}
                      {formatPriceDisplay(selectedVariant?.price)}
                    </span>
                  </>
                ) : (
                  <span className="textColor text-base font-medium leading-6">
                    {setting?.currency}
                    {formatPriceDisplay(selectedVariant?.price)}
                  </span>
                )}
              </div>
            ) : (
              <span className="text-red-600 text-xs font-medium">
                {t("OutOfStock")}
              </span>
            )}
          </div>

          {/* discount % */}
          {!isProductAvailabel &&
          selectedVariant?.discounted_price !== 0 &&
          selectedVariant?.discounted_price !== selectedVariant?.price ? (
            <span className="primaryColor text-sm font-black leading-4">
              {Math.round(
                calculateDiscount(
                  selectedVariant?.discounted_price,
                  selectedVariant?.price
                )
              )}
              % {t("off")}
            </span>
          ) : null}
        </div>

        {/* Right: image + add overlay */}
        <div className="relative w-32 shrink-0 p-2">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
            <ImageWithPlaceholder
              src={product?.image_url}
              alt={product?.name}
              width={400}
              height={400}
              className="w-full h-full object-contain"
              sizes="(max-width: 1024px) 33vw, 200px"
              quality={75}
            />
            {/* hover wishlist/eye */}
            <ul className="absolute right-2 top-2 lg:flex flex-col gap-2 translate-x-10 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-in-out hidden">
              <li
                className="buttonBorder hover:primaryBorder hover:primaryColor rounded-full h-[30px] w-[30px] flex justify-center items-center bodyBackgroundColor"
                onClick={handleProductLikes}
              >
                <span>
                  {favoriteProducts && favoriteProducts?.includes(product?.id) ? (
                    <BiSolidHeart size={20} className="primaryFilledColor" />
                  ) : (
                    <BiHeart size={20} className="svgColors hover:primaryColor" />
                  )}
                </span>
              </li>
              <li className="buttonBorder hover:primaryBorder rounded-full h-[30px] w-[30px] flex justify-center items-center bodyBackgroundColor hover:cursor-pointer">
                <span onClick={handleShowDetailModal}>
                  <FaRegEye size={18} className="svgColors hover:primaryColor" />
                </span>
              </li>
            </ul>
          </div>

          {/* Add to cart / quantity stepper */}
          <div
            className="absolute bottom-3 right-3"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {!isProductAvailabel ? (
              isProductAlreadyAdded ? (
                <div className="flex items-center gap-3 primaryBackColor rounded-lg px-2 py-1.5 shadow">
                  <button
                    type="button"
                    className="flex items-center justify-center text-white"
                    onClick={handleQuantityDecrease}
                    aria-label="decrease"
                  >
                    <FaMinus size={12} />
                  </button>
                  <span className="min-w-4 text-center text-white text-base font-bold leading-none">
                    {addedQuantity}
                  </span>
                  <button
                    type="button"
                    className="flex items-center justify-center text-white"
                    onClick={handleQuantityIncrease}
                    aria-label="increase"
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              ) : productsVariants?.length > 1 ? (
                <button
                  type="button"
                  className="flex flex-col w-16 rounded-lg overflow-hidden shadow"
                  onClick={(e) => handleShowVariantModal(e, product)}
                  aria-label={t("add")}
                >
                  <span className="py-1 primaryBackColor flex items-center justify-center text-white">
                    <FaPlus size={14} />
                  </span>
                  <span className="px-2 py-0.5 bg-white rounded-b-lg border-l border-r border-b primaryColorBorder primaryColor text-[10px] font-bold text-center leading-tight">
                    {productsVariants?.length} {t("options")}
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  className="p-2 primaryBackColor rounded-lg flex items-center justify-center text-white shadow hover:opacity-90 transition"
                  onClick={handleIntialAddToCart}
                  aria-label={t("add")}
                >
                  <FaPlus size={16} />
                </button>
              )
            ) : null}
          </div>
        </div>
      </LocalizedLink>
      <ProductDetailModal
        product={product}
        showDetailModal={showProductDetail}
        setShowDetailModal={setShowProductDetail}
      />
      <VariantsModal
        product={product}
        showVariants={showVariants}
        setShowVariants={setShowVariants}
      />
      <SingleSellerConfirmationModal
        showSingleSellerModal={showSingleSellerModal}
        setSingleSellerModal={setSingleSellerModal}
        product={product}
        selectedVariant={selectedVariant}
      />
    </div>
  );
};

export default ListViewProductCard;
