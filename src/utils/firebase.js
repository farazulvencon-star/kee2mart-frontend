import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";
import { setFcmToken } from "@/redux/slices/userSlice";
import { createStickyNote } from "./stickynote";
import { t } from "./translation";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
let messaging = null;

const getMessagingInstance = async () => {
  if (messaging) return messaging;
  if (typeof window === "undefined") return null;

  try {
    const isSupportedBrowser = await isSupported();
    if (isSupportedBrowser) {
      messaging = getMessaging(app);
      return messaging;
    } else {
      if (typeof window !== "undefined" && sessionStorage.getItem("hide-unsupported-browser-note") !== "true") {
        console.log("Firebase Messaging is not supported in this browser.");
        createStickyNote();
      }
      return null;
    }
  } catch (err) {
    console.error("Error checking messaging support:", err);
    return null;
  }
};

export const registerNotificationClickHandler = () => {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data?.type === "NOTIFICATION_CLICK") {
      const url = event.data.url;
      window.location.replace(url); // replace() avoids adding to browser history
    }
  });
};

export const registerServiceWorker = () => {
  if (typeof window !== "undefined" && "serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then((registration) => {
        console.log(
          "Service Worker registration successful, scope is:",
          registration.scope
        );
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
      });
  }
};

export const fetchToken = async (dispatch) => {
  try {
    const messagingInstance = await getMessagingInstance();
    if (!messagingInstance) {
      console.log("Messaging not initialized, can't fetch token.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Unable to get permission to notify.");
      return;
    }

    const currentToken = await getToken(messagingInstance, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    });

    if (currentToken) {
      dispatch(setFcmToken({ data: currentToken }));
    } else {
      console.log(
        "No registration token available. Request permission to generate one."
      );
    }
  } catch (err) {
    console.error("An error occurred while retrieving token.", err);
  }
};

export const onMessageListener = () => {
  return new Promise(async (resolve) => {
    const messagingInstance = await getMessagingInstance();
    if (messagingInstance) {
      onMessage(messagingInstance, (payload) => {
        // 🔔 Log the full FCM payload received in the foreground (tab focused).
        console.log("[FCM-foreground] payload:", payload);
        console.log("[FCM-foreground] payload.data:", payload?.data);
        console.log("[FCM-foreground] payload.notification:", payload?.notification);
        const data = payload.data || {};
         if (Notification.permission === "granted") {
          const notification = new Notification(data.title || "New Notification", {
            body: data.body,
            icon: data.icon,
            image: data.image,
            data: {
              type: data.type,
              id: data.id,
              url: getRedirectUrl(data),
              slug: data.type_slug,
            },
          });

          // ✅ Handle click on foreground notification
          notification.onclick = () => {
            const targetUrl = getRedirectUrl(data);
            window.focus();
            window.location.href = targetUrl;
            notification.close();
          };
        }
        resolve(payload);
      });
    } else {
      resolve(null);

    }
  });
};

export const getRedirectUrl = (data) => {
  const { type, id,type_slug } = data || {};
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const productRequestURL = type_slug == "" ? `${base}/profile/requested-products` : `${base}/product/${type_slug}`;


  switch (type) {
    case "order":
      return `${base}/order-detail/${id}`;
    case "product":
      return `${base}/product/${type_slug}`;
    case "category":
      return `${base}/categories/all`;
    case "cart":
      return `${base}/checkout`;
    case "product_request":
      return productRequestURL;
    default:
      return `${base}/`;
  }
};


// Map a Firebase Auth error to a user-friendly, translated message.
// Falls back to the raw Firebase message when the code isn't mapped.
export const getFirebaseAuthErrorMessage = (error) => {
  const code = error?.code || "";
  const message = error?.message || "";
  if (
    code === "auth/too-many-requests" ||
    message.includes("auth/too-many-requests")
  ) {
    return t("firebase_temp_block");
  }
  return message;
};

export { app, auth };
