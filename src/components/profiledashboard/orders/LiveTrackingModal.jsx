import React, { use, useCallback, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { RiCloseFill } from "react-icons/ri";
import { t } from "@/utils/translation";
import * as api from "@/api/apiRoutes";
import { useSelector } from "react-redux";
import { useJsApiLoader } from "@react-google-maps/api";
import {
  GoogleMap,
  Marker,
  Polyline,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { BiChevronRight, BiPhoneCall } from "react-icons/bi";
import { IoLocationOutline } from "react-icons/io5";
import { LocalizedLink } from "@/utils/localizedNav";
import userIcon from "@/assets/customer_location.svg?url";
import deliveryBoyIcon from "@/assets/delivery_boy.svg?url";
import { MAP_CONFIG } from "@/utils/mapConfig";
import { toast } from "react-toastify";
import Loader from "@/components/loader/Loader";

const LiveTrackingModal = ({
  showLiveTracking,
  setShowLiveTracking,
  order,
}) => {
  const setting = useSelector((state) => state.Setting.setting);
  const [map, setMap] = useState(null);
  const [riderLocation, setRiderLocation] = useState();
  const [userLocation, setUserLocation] = useState({
    lat: null,
    lng: null,
  });

  const [showOverlay, setShowOverlay] = useState(false);
  const [directions, setDirections] = useState(null);
  const { isLoaded, loadError } = useJsApiLoader(MAP_CONFIG);
  const fetchLocation = async () => {
    try {
      const res = await api.liveOrderTracking({ orderId: order?.id });
      if (res.status == 0) {
        setShowOverlay(true);
      } else {
        const latitude = parseFloat(res?.data?.latitude);
        const longitude = parseFloat(res?.data?.longitude);
        setRiderLocation({ lat: latitude, lng: longitude });
        setShowOverlay(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    if (showLiveTracking) {
      fetchLocation(order?.id);
    }
  }, [order, showLiveTracking]);

  useEffect(() => {
    let interval;
    if (showLiveTracking) {
      interval = setInterval(() => {
        if (showLiveTracking) {
          fetchLocation(order?.id);
        }
      }, 5000);
    }
    return () => {
      clearInterval(interval);
    };
  }, [showLiveTracking, fetchLocation, order?.id]);

  useEffect(() => {
    if (order?.latitude && order?.longitude) {
      setUserLocation({
        lat: parseFloat(order?.latitude),
        lng: parseFloat(order?.longitude),
      });
    }
  }, [order]);

  const handleHideLiveTracking = () => {
    setShowLiveTracking(false);
  };

  useEffect(() => {
    if (riderLocation && userLocation && map) {
      // NOTE: when live location tracking is on
      // if (setting?.enable_road_path_tracking === "1") {
      //   const directionsService = new window.google.maps.DirectionsService();
      //   directionsService.route(
      //     {
      //       origin: riderLocation,
      //       destination: userLocation,
      //       travelMode: window.google.maps.TravelMode.DRIVING,
      //     },
      //     (result, status) => {
      //       if (status === window.google.maps.DirectionsStatus.OK) {
      //         setDirections(result);
      //       } else {
      //         console.error("Error fetching directions", result);
      //       }
      //     }
      //   );
      // }
      // // NOTE: when live location tracking is off
      // else {
      const bounds = new window.google.maps.LatLngBounds(
        riderLocation && riderLocation,
      );
      bounds.extend(riderLocation);
      bounds.extend(userLocation);
      map.fitBounds(bounds);
    }
    // }
  }, [riderLocation, userLocation, map]);

  const onLoad = useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  const containerStyle = {
    width: "100%",
    height: "calc(50vh - 100px)",
  };

  const polylineOptions = isLoaded
    ? {
        strokeColor: "#16a34a",
        strokeOpacity: 0.9,
        strokeWeight: 6,
        icons: [
          {
            icon: {
              path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
              scale: 3,
              strokeColor: "#16a34a",
              strokeWeight: 2,
              fillColor: "#16a34a",
              fillOpacity: 1,
            },
            offset: "50%",
          },
        ],
      }
    : {};

  useEffect(() => {
    if (loadError) {
      toast.error(t("map_failed_to_load"));
    }
  }, [loadError]);

  if (!isLoaded) {
    return <Loader />;
  }

  return (
    <Dialog open={showLiveTracking}>
      <DialogContent className="w-full ">
        <DialogHeader className="font-bold text-2xl text-start flex flex-row justify-between">
          {t("livetracking")}
          <div className="closeButtonBg rounded-full p-[8px] gap-[4px] cursor-pointer">
            <RiCloseFill size={22} onClick={handleHideLiveTracking} />
          </div>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="w-full">
            <div className="relative">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={riderLocation && riderLocation}
                onLoad={onLoad}
                onUnmount={onUnmount}
                zoom={15}
              >
                {/* {setting?.enable_road_path_tracking === "1"
                  ? // NOTE: when live location tracking is on
                    directions && (
                      <DirectionsRenderer
                        directions={directions}
                        options={{
                          polylineOptions: polylineOptions,
                          suppressMarkers: true,
                        }}
                      />
                    )
                  : // NOTE: when live location tracking is off */}
                {riderLocation && userLocation && (
                  <Polyline
                    path={[riderLocation, userLocation]}
                    options={polylineOptions}
                  />
                )}

                <Marker
                  position={riderLocation}
                  icon={{
                    url: deliveryBoyIcon?.src,
                    scaledSize: new window.google.maps.Size(40, 40), // Resize as needed
                  }}
                  animation={google.maps.Animation.DROP}
                />

                <Marker
                  position={userLocation}
                  icon={{
                    url: userIcon?.src,
                    scaledSize: new window.google.maps.Size(40, 40), // Resize as needed
                  }}
                  animation={google.maps.Animation.DROP}
                />
              </GoogleMap>
              {showOverlay && (
                <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/90">
                  <div className="bg-white rounded-lg shadow-md p-5 text-center">
                    <p className="text-[#dc3545] font-bold">
                      {t("unable_to_load_tracking_data")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="w-full pt-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h1 className="text-xl font-semibold">{t("orderDetail")}</h1>
              <h3 className="flex items-center text-lg">
                {t("order")} #{order?.id} <BiChevronRight />
              </h3>
            </div>
            <div className="flex items-center gap-4 mt-4">
              <IoLocationOutline size={30} />
              <div>
                <h3 className="text-lg font-semibold">
                  {t("deliveryAddress")}
                </h3>
                <p className="text-sm m-0">{order?.address}</p>
              </div>
            </div>
            {order?.delivery_boy_name && (
              <div className="mt-4">
                <p className="text-lg font-medium">
                  {t("delivery_partner_details ")}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold">
                        {order?.delivery_boy_name}
                      </h2>
                      <p className="text-sm">{order?.delivery_boy_mobile}</p>
                    </div>
                  </div>
                  <div className="bg-blue-500 p-2 rounded-full">
                    <LocalizedLink
                      href={`tel:${order?.delivery_boy_mobile || ""}`}
                      className="text-white"
                    >
                      <BiPhoneCall size={25} />
                    </LocalizedLink>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LiveTrackingModal;
