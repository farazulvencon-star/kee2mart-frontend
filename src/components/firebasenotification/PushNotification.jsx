"use client";

import { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  fetchToken,
  onMessageListener,
  registerServiceWorker,

} from "@/utils/firebase";

const PushNotificationLayout = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    registerServiceWorker();
    fetchToken(dispatch);
    const unsubscribe = onMessageListener()
      .then((payload) => {
        console.log("payload", payload)
        if (payload) {
          new Notification(payload.notification.title, {
            body: payload.notification.body,
            icon: payload.notification.icon,
          });
        }
      })
      .catch((err) =>
        console.error("Failed to listen for foreground messages:", err)
      );

    return () => { };
  }, [dispatch]);

  return <>{children}</>;
};

export default PushNotificationLayout;
