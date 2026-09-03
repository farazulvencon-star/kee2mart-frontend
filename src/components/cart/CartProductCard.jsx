import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import * as api from "@/api/apiRoutes";
import {
  addtoGuestCart,
  clearCartPromo,
  setCartProducts,
  setCartPromo,
  setCartSubTotal,
  setGuestCartTotal,
} from "@/redux/slices/cartSlice";
import { toast } from "react-toastify";
import { BiTrash } from "react-icons/bi";
import { FaMinus, FaPlus } from "react-icons/fa";
import ImageWithPlaceholder from "../image-with-placeholder/ImageWithPlaceholder";
import { t } from "@/utils/translation";
import { removeProductFromPrescriptions } from "@/redux/slices/checkoutSlice";
import PrescriptionSelectCheckbox from "./PrescriptionSelectCheckbox";
import PrescriptionStatusBadge from "./PrescriptionStatusBadge";

const CartProductCard = ({
  product,
  cartProductsData,
  setCartProductsData,
  showPrescriptionSelect = false,
}) => {
  const dispatch = useDispatch();
  const setting = useSelector((state) => state.Setting.setting);

  const cart = useSelector((state) => state.Cart);
  const coupon = useSelector((state) => state.Cart.promo_code);
  const [totalPrice, setTotalPrice] = useState();

  useEffect(() => {
    let productQuantity = cart?.isGuest
      ? getProductQuantities(cart?.guestCart)
      : getProductQuantities(cart?.cartProducts);
    const productQty = productQuantity?.find(
      (prdct) => prdct?.product_id == product?.product_id,
    )?.qty;
    const finalPrice =
      product?.discounted_price == 0
        ? product?.price
        : product?.discounted_price;
    setTotalPrice(finalPrice * productQty);
  }, [cart]);

  const handleRemoveFromCart = async () => {
    try {
      const response = await api.removeFromCart({
        product_id: product?.product_id,
        product_variant_id: product?.product_variant_id,
      });
      if (response?.status == 1) {
        const remainItems = cart?.cartProducts?.filter(
          (cartProduct) =>
            cartProduct?.product_variant_id !== product?.product_variant_id,
        );
        const updatedProducts = cartProductsData?.filter(
          (cartProduct) =>
            cartProduct?.product_variant_id !== product?.product_variant_id,
        );
        setCartProductsData(updatedProducts);
        dispatch(setCartProducts({ data: remainItems }));
        dispatch(setCartSubTotal({ data: response?.sub_total }));
        // toast.success(response.message)
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleCalculateTotal = (products) => {
    const total = products?.reduce((prev, curr) => {
      prev += curr?.productPrice * curr.qty;
      return prev;
    }, 0);
    dispatch(setCartSubTotal({ data: total }));
    dispatch(setGuestCartTotal({ data: total }));
  };

  const handleGuestCartRemove = () => {
    const remainItems = cart?.guestCart?.filter(
      (cartProduct) =>
        cartProduct?.product_variant_id !== product?.product_variant_id,
    );
    const updatedProducts = cartProductsData?.filter(
      (cartProduct) =>
        cartProduct?.product_variant_id !== product?.product_variant_id,
    );
    setCartProductsData(updatedProducts);
    dispatch(addtoGuestCart({ data: remainItems }));
    handleCalculateTotal(remainItems);
  };

  const handleRemoveItem = async () => {
    if (cart.isGuest) {
      handleGuestCartRemove();
    } else {
      await handleRemoveFromCart();
    }
    // Drop this line from any prescription selection/group.
    dispatch(
      removeProductFromPrescriptions({ productId: product?.product_variant_id })
    );
  };

  const getProductQuantities = (products) => {
    return Object.entries(
      products?.reduce((quantities, product) => {
        const existingQty = quantities[product.product_id] || 0;
        return {
          ...quantities,
          [product.product_id]: existingQty + product.qty,
        };
      }, {}),
    ).map(([productId, qty]) => ({
      product_id: parseInt(productId),
      qty,
    }));
  };

  const handleQuantityIncrease = async () => {
    try {
      let productQuantity = cart?.isGuest
        ? getProductQuantities(cart?.guestCart)
        : getProductQuantities(cart?.cartProducts);
      const productQty = productQuantity?.find(
        (prdct) => prdct?.product_id == product?.product_id,
      )?.qty;
      const cartProductQty = cart.cartProducts.find(
        (prdct) =>
          prdct?.product_id == product?.product_id &&
          prdct?.product_variant_id == product?.product_variant_id,
      );
      if (product?.is_unlimited_stock !== 0) {
        if (productQty >= Number(product?.total_allowed_quantity)) {
          toast.error(t("max_cart_limit_error"));
        } else {
          if (cart.isGuest) {
            let updatedProducts = cart?.guestCart?.map((cartProduct) => {
              if (
                cartProduct?.product_id == product?.product_id &&
                cartProduct?.product_variant_id == product?.product_variant_id
              ) {
                return { ...cartProduct, qty: Number(cartProduct?.qty + 1) };
              } else {
                return cartProduct;
              }
            });
            handleCalculateTotal(updatedProducts);
            dispatch(addtoGuestCart({ data: updatedProducts }));
          } else {
            try {
              const response = await api.addToCart({
                product_id: product?.product_id,
                product_variant_id: product?.product_variant_id,
                qty: Number(cartProductQty.qty + 1),
              });
              if (response.status == 1) {
                let updatedProducts = cart?.cartProducts?.map((cartProduct) => {
                  if (
                    cartProduct?.product_id == product?.product_id &&
                    cartProduct?.product_variant_id ==
                    product?.product_variant_id
                  ) {
                    return { ...cartProduct, qty: cartProductQty?.qty + 1 };
                  } else {
                    return cartProduct;
                  }
                });

                dispatch(setCartSubTotal({ data: response.sub_total }));
                dispatch(setCartProducts({ data: updatedProducts }));
                await handleApplyCoupon(response.sub_total);
              }
            } catch (error) {
              console.log("Error", error);
            }
          }
        }
      } else {
        if (productQty >= Number(product?.stock)) {
          toast.error(t("out_of_stock_message"));
        } else if (productQty >= Number(product?.total_allowed_quantity)) {
          toast.error(t("max_cart_limit_error"));
        } else {
          if (cart.isGuest) {
            let updatedProducts = cart?.guestCart?.map((cartProduct) => {
              if (
                cartProduct?.product_id == product?.product_id &&
                cartProduct?.product_variant_id == product?.product_variant_id
              ) {
                return { ...cartProduct, qty: Number(cartProduct?.qty + 1) };
              } else {
                return cartProduct;
              }
            });
            handleCalculateTotal(updatedProducts);
            dispatch(addtoGuestCart({ data: updatedProducts }));
          } else {
            try {
              const response = await api.addToCart({
                product_id: product?.product_id,
                product_variant_id: product?.product_variant_id,
                qty: Number(cartProductQty.qty + 1),
              });
              if (response.status == 1) {
                let updatedProducts = cart?.cartProducts?.map((cartProduct) => {
                  if (
                    cartProduct?.product_id == product?.product_id &&
                    cartProduct?.product_variant_id ==
                    product?.product_variant_id
                  ) {
                    return { ...cartProduct, qty: cartProductQty?.qty + 1 };
                  } else {
                    return cartProduct;
                  }
                });
                dispatch(setCartSubTotal({ data: response.sub_total }));
                dispatch(setCartProducts({ data: updatedProducts }));
                await handleApplyCoupon(response.sub_total);
              }
            } catch (error) {
              console.log("Error", error);
            }
          }
        }
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  // Calling this function on every increament decreament so total adjust with coupon card
  const handleApplyCoupon = async (total) => {
    try {
      const response = await api.setPromoCode({
        promoCodeName: coupon?.promo_code,
        amount: total,
      });
      if (response.status == 1) {
        dispatch(setCartPromo({ data: response.data }));
      } else {
        await handleRemoveCoupon();
      }
    } catch (error) {
      console.log("Error", error);
    }
  };

  const handleQuantityDecrease = async () => {
    try {
      let productQuantity;
      if (cart?.isGuest) {
        productQuantity = getProductQuantities(cart?.guestCart);
      } else {
        productQuantity = getProductQuantities(cart?.cartProducts);
      }
      const productQty = productQuantity?.find(
        (prdct) => prdct?.product_id == product?.product_id,
      )?.qty;
      const variantQty = cart?.guestCart?.find(
        (prdct) =>
          prdct?.product_id == product?.product_id &&
          prdct?.product_variant_id == product?.product_variant_id,
      )?.qty;
      const cartProductQty = cart.cartProducts.find(
        (prdct) =>
          prdct?.product_id == product?.product_id &&
          prdct?.product_variant_id == product?.product_variant_id,
      );
      if (cart.isGuest) {
        if (variantQty <= 1) {
          return;
        }
        let updatedProducts = cart?.guestCart?.map((cartProduct) => {
          if (
            cartProduct?.product_id == product?.product_id &&
            cartProduct?.product_variant_id == product?.product_variant_id
          ) {
            return { ...cartProduct, qty: Number(cartProduct?.qty - 1) };
          } else {
            return cartProduct;
          }
        });
        handleCalculateTotal(updatedProducts);
        dispatch(addtoGuestCart({ data: updatedProducts }));
      } else {
        if (cartProductQty.qty <= 1) {
          return;
        }
        try {
          const response = await api.addToCart({
            product_id: product?.product_id,
            product_variant_id: product?.product_variant_id,
            qty: Number(cartProductQty.qty - 1),
          });
          if (response.status == 1) {
            let updatedProducts = cart?.cartProducts?.map((cartProduct) => {
              if (
                cartProduct?.product_id == product?.product_id &&
                cartProduct?.product_variant_id == product?.product_variant_id
              ) {
                return { ...cartProduct, qty: cartProductQty?.qty - 1 };
              } else {
                return cartProduct;
              }
            });
            dispatch(setCartSubTotal({ data: response.sub_total }));
            dispatch(setCartProducts({ data: updatedProducts }));
            await handleApplyCoupon(response.sub_total);
          }
        } catch (error) {
          console.log("Error", error);
        }
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleRemoveCoupon = async () => {
    dispatch(clearCartPromo());
  };

  const addedQuantity =
    cart.isGuest === false
      ? cart?.cartProducts?.find(
        (prdct) => prdct?.product_variant_id == product?.product_variant_id
      )?.qty
      : cart?.guestCart?.find(
        (prdct) => prdct?.product_variant_id == product?.product_variant_id
      )?.qty;
      console.log(product)
  return (
    <div className="  gap-4 p-4 border-b w-full min-w-0">
      <div className=" hidden md:grid grid-cols-12 items-center ">
        {/* Product Image and Details */}
        <div className="col-span-4 flex items-center gap-3">
          {showPrescriptionSelect && (
            <div className="w-5 flex justify-center flex-shrink-0">
              <PrescriptionSelectCheckbox product={product} />
            </div>
          )}
          <div className="relative w-[64px] h-[64px] rounded-sm flex-shrink-0 cardBorder p-1">
            <ImageWithPlaceholder
              src={product?.image_url}
              alt={product?.product?.translations?.name}
              width={380}
              height={380}
              className="w-full h-full object-cover  flex-shrink-0"
            />
          </div>
          <div>
            <h3 className="text-base font-bold text-ellipsis overflow-hidden  min-w-[147px]">
              {product?.product?.translations?.name}
            </h3>
            <p className="text-xs font-normal">
              {product?.measurement} {product?.unit?.translations?.short_code}
            </p>
            {showPrescriptionSelect && (
              <PrescriptionStatusBadge product={product} className="mt-1" />
            )}
          </div>
        </div>

        {/* Product Price */}
        <div className="col-span-2 text-center px-1 overflow-hidden">
          {product?.discounted_price !== 0 ? (
            <div className="flex flex-col items-center">
              <h2 className="text-base font-bold break-all max-w-full">
                {setting?.currency}
                {product?.discounted_price}
              </h2>
              <p className="text-sm font-normal line-through break-all max-w-full">
                {setting?.currency} {product?.price}
              </p>
            </div>
          ) : (
            <h2 className="text-base font-bold break-all max-w-full">
              {setting?.currency} {product?.price}
            </h2>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="col-span-3 flex items-center justify-center rounded cardBorder">
          <button className="px-2 py-1" onClick={handleQuantityDecrease}>
            <FaMinus />
          </button>
          <input
            className="py-1 text-base w-2/3 text-center"
            value={addedQuantity}
            disabled
          />
          <button className="px-2 py-1" onClick={handleQuantityIncrease}>
            <FaPlus />
          </button>
        </div>

        {/* Total Price */}
        <div className="col-span-2 text-center px-1 overflow-hidden">
          <p className="text-base font-bold break-all max-w-full">
            {setting?.currency}
            {totalPrice}
          </p>
        </div>

        {/* Remove Button */}
        <div className="col-span-1 text-center">
          <button
            className="text-red-600 hover:text-red-800"
            onClick={handleRemoveItem}
          >
            <BiTrash size={26} />
          </button>
        </div>
      </div>
      {/* Mobile Card  */}
      <div className="flex flex-col md:hidden gap-2 w-full overflow-hidden">
        {showPrescriptionSelect && (
          <div className="flex items-center justify-between gap-2">
            <PrescriptionSelectCheckbox product={product} showNote />
            <PrescriptionStatusBadge product={product} />
          </div>
        )}
        <div className="flex justify-between ">
          <div>
            <div className="relative w-[72px] h-[72px] rounded-sm flex-shrink-0 cardBorder p-1">
              <ImageWithPlaceholder
                src={product?.image_url}
                alt={product?.product?.translations?.name}
                width={380}
                height={380}
                className=" h-full w-full object-cover  flex-shrink-0"
              />
            </div>
            <div>
              <h3 className="text-base font-bold truncate max-w-full">
                {product?.product?.translations?.name}
              </h3>

              <p className="text-xs font-normal">
                {product?.measurement} {product?.unit_code}
              </p>
            </div>
          </div>
          <div>
            <button
              className="text-red-600 hover:text-red-800"
              onClick={handleRemoveItem}
            >
              <BiTrash size={26} />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-4 border-t">
          {/* Product Price */}
          <div className="flex justify-between pt-2">
            <div>{t("price")}</div>
            <div className="flex flex-wrap items-center gap-2 max-w-full overflow-hidden">
              {product?.discounted_price !== 0 ? (
                <>
                  <h2 className="text-base font-bold break-all">
                    {setting?.currency}
                    {product?.discounted_price}
                  </h2>
                  <p className="text-sm font-normal line-through break-all">
                    {setting?.currency} {product?.price}
                  </p>
                </>
              ) : (
                <h2 className="text-base font-bold break-all">
                  {setting?.currency} {product?.price}
                </h2>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-between border-t items-center  pt-2">
          <div className="text-center font-bold">{t("quantity")}</div>
          {/* Quantity Selector */}
          <div className="flex items-center justify-center rounded cardBorder">
            <button className="px-2 py-1" onClick={handleQuantityDecrease}>
              <FaMinus />
            </button>
            <input
              className="py-1 text-base max-w-[97px] text-center"
              value={addedQuantity}
              disabled
            />
            <button className="px-2 py-1" onClick={handleQuantityIncrease}>
              <FaPlus />
            </button>
          </div>
        </div>

        <div className="flex justify-between border-t  pt-2">
          <div className=" text-center font-bold">{t("total")}</div>
          {/* Total Price */}
          <div className=" text-center">
            <p className="text-base font-bold">
              {setting?.currency}
              {totalPrice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartProductCard;
