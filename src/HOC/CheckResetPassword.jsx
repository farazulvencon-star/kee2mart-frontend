import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useLocalizedRouter } from "@/utils/localizedNav";

const CheckResetPassword = (WrappedComponent) => {
  const ResetPasswordWrapper = (props) => {
    const router = useLocalizedRouter();
    const [isAbleToReset, setIsAblseToReset] = useState(false);
    const authType = useSelector((state) => state.User.authType);
    const setting = useSelector((state) => state?.Setting?.setting);

    const passwordRoute = ["/profile/resetpassword"];
    const isPasswordRoute = passwordRoute.includes(router.pathname);

    useEffect(() => {
      if (
        isPasswordRoute &&
        !(
          authType == "email" ||
          (authType == "phone" && setting?.phone_auth_password == 1)
        )
      ) {
        router.push("/profile");
      } else {
        setIsAblseToReset(true);
      }
    }, []);

    return isAbleToReset ? <WrappedComponent {...props} /> : null;
  };
  return ResetPasswordWrapper;
};

export default CheckResetPassword;
