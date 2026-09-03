import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { FaShoppingBasket } from "react-icons/fa";
import * as api from "@/api/apiRoutes";
import { useSelector, useDispatch } from "react-redux";
import { t } from "@/utils/translation";
import { formatPriceDisplay } from "@/lib/utils";
import { RiCloseFill } from "react-icons/ri";
import { FiMinus, FiPlus } from "react-icons/fi";
import {
  addGuestCartTotal,
  addtoGuestCart,
  setCart,
  setCartProducts,
  setCartSubTotal,
  subGuestCartTotal,
} from "@/redux/slices/cartSlice";
import { toast } from "react-toastify";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import SingleSellerConfirmationModal from "../single-seller-confirmation-modal/SingleSellerConfirmationModal";
import { useState } from "react";

const VariantsModal = ({ product, showVariants, setShowVariants }) => {
  const dispatch = useDispatch();
  const setting = useSelector((state) => state.Setting);
  const cart = useSelector((state) => state.Cart);
  const activeModuleId = useSelector((state) => state.Module.activeModuleId);

  const [selectedVariant, setSelectedVariant] = useState([]);
  const [showSingleSellerModal, setSingleSellerModal] = useState(false);

  const handleHideVariantModal = () => {
    setShowVariants(false);
  };
  const isAlreadyAdded = (variant) => {
    return (
      (cart?.isGuest === false &&
        cart?.cartProducts?.find(
          (prdct) => prdct?.product_variant_id == variant?.id
        )?.qty > 0) ||
      (cart?.isGuest === true &&
        cart?.guestCart?.find(
          (prdct) => prdct?.product_variant_id === variant?.id
        )?.qty > 0)
    );
  };
  const addedQuantity = (variant) => {
    return cart.isGuest === false
      ? cart?.cartProducts?.find(
        (prdct) => prdct?.product_variant_id == variant?.id
      )?.qty
      : cart?.guestCart?.find(
        (prdct) => prdct?.product_variant_id == variant?.id
      )?.qty;
  };

  const isVariantAvailable = (variant) => {
    return variant?.is_unlimited_stock == 0 && variant?.stock <= 0;
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
  const addToCart = async (productId, variant, qty) => {
    setSelectedVariant(variant);
    try {
      const response = await api.addToCart({
        product_id: productId,
        product_variant_id: variant.id,
        qty: qty,
      });
      if (response.status === 1) {
        if (
          cart?.cartProducts?.find(
            (product) =>
              product?.product_id == productId &&
              product?.product_variant_id == variant.id
          )?.qty == undefined
        ) {
          dispatch(setCart({ data: response }));
          const updatedCartCount = [
            ...cart?.cartProducts,
            { product_id: productId, product_variant_id: variant.id, qty: qty },
          ];
          dispatch(setCartProducts({ data: updatedCartCount }));
          dispatch(setCartSubTotal({ data: response?.sub_total }));
        } else {
          const updatedProducts = cart?.cartProducts?.map((product) => {
            if (
              product.product_id == productId &&
              product?.product_variant_id == variant.id
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
      } else {
        setSingleSellerModal(true);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const removeFromCart = async (productId, variant) => {
    try {
      const response = await api.removeFromCart({
        product_id: productId,
        product_variant_id: variant?.id,
      });
      if (response?.status === 1) {
        const updatedProducts = cart?.cartProducts?.filter(
          (product) => product?.product_variant_id != variant?.id
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
    variant,
    Qty,
    isExisting,
    flag
  ) => {
    const finalPrice =
      variant?.discounted_price !== 0
        ? variant?.discounted_price
        : variant?.price;
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
            product?.product_variant_id == variant.id
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
          (product) => product?.product_variant_id != variant.id
        );
      }
      dispatch(addtoGuestCart({ data: updatedProducts }));
    } else {
      if (flag == "add") {
        dispatch(addGuestCartTotal({ data: finalPrice }));
      } else if (flag == "remove") {
        dispatch(subGuestCartTotal({ data: finalPrice }));
      }
      // dispatch(setGuestCartTotal({ data: finalPrice }))
      const productData = {
        product_id: productId,
        product_variant_id: variant.id,
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
    quantity,
    variant
  ) => {
    const productQty = productQuantity?.find(
      (prdct) => prdct?.product_id == product?.id
    )?.qty;
    if (Number(product.is_unlimited_stock !== 0)) {
      if (productQty >= Number(product?.total_allowed_quantity)) {
        toast.error(t("max_cart_limit_error"));
      } else {
        AddToGuestCart(product, product?.id, variant, quantity, 1, "add");
      }
    } else {
      if (productQty >= Number(variant?.stock)) {
        toast.error(t("out_of_stock_message"));
      } else if (productQty >= Number(product?.total_allowed_quantity)) {
        toast.error(t("max_cart_limit_error"));
      } else {
        AddToGuestCart(product, product?.id, variant, quantity, 1, "add");
      }
    }
  };
  const handleAddNewProductGuest = (productQuantity, product, variant) => {
    const productQty = productQuantity?.find(
      (prdct) => prdct?.product_id == product?.id
    )?.qty;
    if ((productQty || 0) >= Number(product?.total_allowed_quantity)) {
      toast.error(t("max_cart_limit_error"));
    } else if (variant?.is_unlimited_stock == 0 && variant?.stock == 0) {
      toast.error(t("out_of_stock_message"));
    } else if (Number(product.is_unlimited_stock)) {
      AddToGuestCart(product, product.id, variant, 1, 0, "add");
    } else {
      if (variant?.status) {
        AddToGuestCart(product, product.id, variant, 1, 0, "add");
      } else {
        toast.error(t("out_of_stock_message"));
      }
    }
  };
  const handleValidateAddNewProduct = (productQuantity, product, variant) => {
    const productQty = productQuantity?.find(
      (prdct) => prdct?.product_id == product?.id
    )?.qty;
    if ((productQty || 0) >= Number(product?.total_allowed_quantity)) {
      toast.error(t("max_cart_limit_error"));
    } else if (variant?.is_unlimited_stock == 0 && variant?.stock == 0) {
      toast.error(t("out_of_stock_message"));
    } else if (Number(product.is_unlimited_stock)) {
      addToCart(product.id, variant, 1);
    } else {
      if (variant?.status) {
        addToCart(product.id, variant, 1);
      } else {
        toast.error(t("out_of_stock_message"));
      }
    }
  };
  const handleIntialAddToCart = (e, variant) => {
    e.preventDefault();
    const quantity = getProductQuantities(cart?.cartProducts);
    if (cart?.isGuest) {
      handleAddNewProductGuest(quantity, product, variant);
    } else {
      handleValidateAddNewProduct(quantity, product, variant);
    }
  };
  const handleValidateAddExistingProduct = (
    productQuantity,
    product,
    variant
  ) => {
    const productQty = productQuantity?.find(
      (prdct) => prdct?.product_id == product?.id
    )?.qty;
    if (Number(product.is_unlimited_stock)) {
      if (productQty < Number(product?.total_allowed_quantity)) {
        addToCart(
          product.id,
          variant,
          cart?.cartProducts?.find(
            (prdct) => prdct?.product_variant_id == variant?.id
          )?.qty + 1
        );
      } else {
        toast.error(t("max_cart_limit_error"));
      }
    } else {
      if (productQty >= Number(variant.stock)) {
        toast.error(t("out_of_stock_message"));
      } else if (Number(productQty) >= Number(product.total_allowed_quantity)) {
        toast.error(t("max_cart_limit_error"));
      } else {
        addToCart(
          product.id,
          variant,
          cart?.cartProducts?.find(
            (prdct) => prdct?.product_variant_id == variant?.id
          )?.qty + 1
        );
      }
    }
  };
  const handleQuantityIncrease = (e, variant) => {
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
            prdct?.product_variant_id == variant?.id
        )?.qty + 1,
        variant
      );
    } else {
      const quantity = getProductQuantities(cart?.cartProducts);
      handleValidateAddExistingProduct(quantity, product, variant);
    }
  };
  const handleQuantityDecrease = (e, variant) => {
    e.preventDefault();
    e.stopPropagation();
    if (cart?.isGuest) {
      AddToGuestCart(
        product,
        product?.id,
        variant,
        cart?.guestCart?.find(
          (prdct) => prdct?.product_variant_id == variant?.id
        )?.qty - 1,
        1,
        "remove"
      );
    } else {
      if (
        cart?.cartProducts?.find(
          (prdct) => prdct?.product_variant_id == variant?.id
        ).qty == 1
      ) {
        removeFromCart(product?.id, variant);
      } else {
        addToCart(
          product.id,
          variant,
          cart?.cartProducts?.find(
            (prdct) => prdct?.product_variant_id == variant?.id
          )?.qty - 1
        );
      }
    }
  };

  return (
    <>
      <Dialog open={showVariants}>
        <DialogContent className="max-w-xl ">
          <DialogHeader className="font-bold text-2xl text-start flex flex-row justify-between">
            {t("chooseVariant")}
            <div className="closeButtonBg rounded-full p-[8px] gap-[4px] cursor-pointer">
              <RiCloseFill size={22} onClick={handleHideVariantModal} />
            </div>
          </DialogHeader>
          <div className="p-2 md:p-6">
            <div className="backgroundColor rounded-md flex gap-2 p-4 items-center">
              <div className="h-[54px] w-[54px] relative rounded-md ">
                <ImageWithPlaceholder
                  src={product?.image_url}
                  alt={product?.name}
                  width={200}
                  height={200}
                  className="h-full w-full"
                />
              </div>
              <h3 className="font-medium text-base leading-[24px] break-all">
                {product?.translations?.name}
              </h3>
            </div>
            <div>
              {product?.variants?.map((variant) => {
                const isAdded = isAlreadyAdded(variant);
                const quantity = addedQuantity(variant);
                const isVariantInStock = isVariantAvailable(variant);
                return (
                  <div
                    className="flex justify-between items-center px-4 py-2"
                    key={variant?.id}
                  >
                    <div className="font-medium text-lg">{`${variant?.measurement} ${variant?.unit?.translations?.short_code}`}</div>
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-3 font-bold text-base ">
                        <span className="flex items-baseline gap-1.5">
                          <span>
                            {setting?.setting?.currency}
                            {formatPriceDisplay(
                              variant?.discounted_price == 0
                                ? variant?.price
                                : variant?.discounted_price
                            )}
                          </span>
                          {variant?.discounted_price != 0 &&
                            variant?.discounted_price != variant?.price && (
                              <span className="text-xs font-normal line-through opacity-50">
                                {setting?.setting?.currency}
                                {formatPriceDisplay(variant?.price)}
                              </span>
                            )}
                        </span>
                        {!isVariantInStock ? (
                          isAdded ? (
                            <div className="flex items-center gap-3 primaryBackColor rounded-lg px-2 py-1.5 shadow">
                              <button
                                type="button"
                                className="flex items-center justify-center text-white"
                                onClick={(e) =>
                                  handleQuantityDecrease(e, variant)
                                }
                                aria-label="decrease"
                              >
                                <FiMinus size={14} />
                              </button>
                              <span className="min-w-4 text-center text-white text-base font-bold leading-none">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                className="flex items-center justify-center text-white"
                                onClick={(e) =>
                                  handleQuantityIncrease(e, variant)
                                }
                                aria-label="increase"
                              >
                                <FiPlus size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="p-2 primaryBackColor rounded-lg flex items-center justify-center text-white shadow hover:opacity-90 transition"
                              onClick={(e) => handleIntialAddToCart(e, variant)}
                              aria-label={t("add")}
                            >
                              <FiPlus size={18} />
                            </button>
                          )
                        ) : (
                          <div className="font-bold text-[#db3d26]">
                            {t("out_of_stock")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <SingleSellerConfirmationModal
        showSingleSellerModal={showSingleSellerModal}
        setSingleSellerModal={setSingleSellerModal}
        product={product}
        selectedVariant={selectedVariant}
      />
    </>
  );
};

export default VariantsModal;
