import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
} from "@/components/ui/dialog";
import { debounce } from "lodash";
import { t } from "@/utils/translation";
import { useSelector } from "react-redux";
import Image from "next/image";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { GoogleMap, MarkerF, useJsApiLoader } from "@react-google-maps/api";
import * as api from "@/api/apiRoutes";
import { setCity } from "@/redux/slices/citySlice";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setShop } from "@/redux/slices/shopSlice";
import Loader from "../loader/Loader";
import { RiCloseFill } from "react-icons/ri";
import { darkThemeStyles } from "@/utils/mapColor";
import { MAP_CONFIG } from "@/utils/mapConfig";

const Location = ({ showLocation, setShowLocation }) => {
  const city = useSelector((state) => state.City);
  const setting = useSelector((state) => state.Setting);
  const theme = useSelector((state) => state.Theme.theme);
  const inputDomRef = useRef(null);
  const debounceTimeoutRef = useRef(null);
  const dispatch = useDispatch();
  const [mapView, setMapView] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, seterrorMsg] = useState("");
  const [center, setCenter] = useState();
  const [inputValue, setInputValue] = useState("");
  const [resultedPlaces, setResultedPlaces] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  

  const { isLoaded } = useJsApiLoader(MAP_CONFIG);

  const [localLocation, setlocalLocation] = useState({
    city: "",
    formatted_address: "",
    lat: parseFloat(0),
    lng: parseFloat(0),
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setlocalLocation({ lat: lat, lng: lng });
      },
      (error) => {
        // No-GPS devices can fail here (browser network provider 429). Fail
        // quietly — the user can still pick a location manually.
        console.log("Geolocation error (initial):", error);
      },
      {
        // Coarse + cached: avoid forcing a fresh high-accuracy network lookup
        // (the call that hits Google's rate-limited provider on desktops).
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      }
    );
  }, [showLocation]);

  useEffect(() => {
    const center = {
      lat: localLocation.lat,
      lng: localLocation.lng,
      streetViewControl: false,
    };
    setCenter(center);
  }, [localLocation.lat, localLocation.lng]);

  useEffect(() => {
    const inputEl = inputDomRef.current;
    if (inputEl) {
      inputEl.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      if (inputEl) {
        inputEl.removeEventListener("keydown", handleKeyDown);
      }
    };
  }, [resultedPlaces, highlightedIndex]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (value.length > 2) {
        handleFetchPlaces(value);
      } else {
        setResultedPlaces([]);
      }
    }, 1000);
  };

  const handleCloseLocation = () => {
    setShowLocation(false);
    setMapView(false);
  };

  const handleViewMap = async () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        // Success callback
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setlocalLocation({ lat: lat, lng: lng });

        const geocoder = new window.google.maps.Geocoder();
        try {
          const response = await geocoder.geocode({
            location: { lat, lng },
          });

          if (response.results[0]) {
            setlocalLocation((state) => ({
              ...state,
              formatted_address: response.results[0].formatted_address,
            }));
          }
          setMapView(true);
        } catch (error) {
          toast.error(t("provided_api_invalid"));
          console.log("err", error);
        }
      },
      (error) => {
        // Error callback
        console.log("Geolocation error:", error);

        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error(
              t("location_permission_denied") ||
                "Please enable location permission in your browser",
            );
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error(
              t("location_unavailable") ||
                "Location information is unavailable",
            );
            break;
          case error.TIMEOUT:
            toast.error(t("location_timeout") || "Location request timed out");
            break;
          default:
            toast.error(
              t("location_error") ||
                "An unknown error occurred while getting location",
            );
            break;
        }
      },
      {
        // Coarse + cached so the browser can reuse a recent position instead of
        // forcing a fresh high-accuracy network call (which hits Google's
        // rate-limited provider / 429 on no-GPS devices).
        enableHighAccuracy: false,
        timeout: 15000,
        maximumAge: 300000,
      },
    );
  };

  const handleConfirmLocation = async (
    latitude,
    longitude,
    cityName,
    formattedAddress,
  ) => {
    try {
      if (errorMessage !== "") {
        setInputValue("");
        toast.error("We are not deliver on this city");
        return;
      }
      const result = await api.getCity({
        latitude: latitude ? latitude : localLocation.lat,
        longitude: longitude ? longitude : localLocation.lng,
      });
      if (result?.status == 1) {
        dispatch(
          setCity({
            data: {
              id: result.data.id,
              name: cityName ? cityName : localLocation.city,
              state: result.data.state,
              formatted_address: formattedAddress
                ? formattedAddress
                : localLocation.formatted_address,
              latitude: result.data.latitude,
              longitude: result.data.longitude,
              min_amount_for_free_delivery:
                result.data.min_amount_for_free_delivery,
              delivery_charge_method: result.data.delivery_charge_method,
              fixed_charge: result.data.fixed_charge,
              per_km_charge: result.data.per_km_charge,
              time_to_travel: result.data.time_to_travel,
              max_deliverable_distance: result.data.max_deliverable_distance,
              distance: result.data.distance,
            },
          }),
        );
        fetchShop(result.data.latitude, result.data.longitude);
        setShowLocation(false);
        setInputValue("");
        setResultedPlaces([]);
        setAddressLoading(false);
        seterrorMsg("");
        setMapView(false);
      } else if (result.status == 0) {
        setLoading(false);
        toast.error(t("We_doesn't_deliver_at_selected_city"));
        setShowLocation(true);
      } else {
        setLoading(false);
        seterrorMsg(result.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const fetchShop = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await api.getShop({ latitude: lat, longitude: lng });
      dispatch(setShop({ data: response.data }));
      setLoading(false);
    } catch (error) {
      console.log("error", error);
      setLoading(false);
    }
  };

  const handleMapClick = (e) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder
      .geocode({ location: { lat: e.latLng.lat(), lng: e.latLng.lng() } })
      .then((res) => {
        if (res.results[0]) {
          debouncedGetAvailableCity(
            res,
            setlocalLocation,
            setAddressLoading,
            seterrorMsg,
          );
        } else {
          toast.error("City not found");
        }
      })
      .catch((error) => {
        console.log("err", error);
      });
  };

  const getAvailableCity = async (response) => {
    try {
      const firstResult = response.results[0];
      if (!firstResult) {
        return { status: 0, message: "City not found" };
      }

      const { lat, lng } = firstResult.geometry.location;
      const res = await api.getCity({
        latitude: lat(),
        longitude: lng(),
      });

      return res;
    } catch (error) {
      console.error("Error in getAvailableCity:", error);
      return { status: 0, message: "Error fetching city" };
    }
  };

  const debouncedGetAvailableCity = debounce(
    async (res, setlocalLocation, setAddressLoading, seterrorMsg) => {
      const result = await getAvailableCity(res);

      if (result.status === 1) {
        setlocalLocation({
          // Show Google's full address (not the backend's city-level string)
          // even when the point is inside a deliverable zone.
          formatted_address: res.results[0].formatted_address,
          city: result?.data?.name,
          lat: res.results[0].geometry.location.lat(),
          lng: res.results[0].geometry.location.lng(),
        });
        setAddressLoading(false);
        seterrorMsg("");
      } else {
        setlocalLocation({
          city: null,
          formatted_address: res.results[0].formatted_address,
          lat: res.results[0].geometry.location.lat(),
          lng: res.results[0].geometry.location.lng(),
        });
        setAddressLoading(false);
        seterrorMsg(result.message);
      }
    },
    500,
  );

  const onMarkerDragStart = () => {
    setAddressLoading(true);
  };

  const handleDragEnd = async (e) => {
    const geocoder = new window.google.maps.Geocoder();
    const response = await geocoder
      .geocode({
        location: {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        },
      })
      .then(async (res) => {
        if (res.results[0]) {
          const result = await getAvailableCity(res);
          if (result.status == 1) {
            setlocalLocation({
              // Show Google's full address (not the backend's city-level string)
              // even when the point is inside a deliverable zone.
              formatted_address: res.results[0].formatted_address,
              city: result?.data?.name,
              lat: res.results[0].geometry.location.lat(),
              lng: res.results[0].geometry.location.lng(),
            });
            setAddressLoading(false);
            seterrorMsg("");
          } else {
            setlocalLocation({
              city: null,
              formatted_address: res.results[0].formatted_address,
              lat: res.results[0].geometry.location.lat(),
              lng: res.results[0].geometry.location.lng(),
            });
            setAddressLoading(false);
            // setisloading(false);
            seterrorMsg(res.message);
          }
        } else {
          toast.error("City not found");
        }
      })
      .catch((error) => {
        console.log("err", error);
      });
  };

  const handleKeyDown = (e) => {
    if (!resultedPlaces?.suggestions?.length) return;
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) =>
        prev < resultedPlaces.suggestions?.length - 1 ? prev + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : resultedPlaces?.suggestions?.length - 1,
      );
    } else if (e.key === "Enter") {
      if (highlightedIndex >= 0) {
        const selected = resultedPlaces?.suggestions[highlightedIndex];
        handleSelectLocation(selected?.placePrediction);
      }
    }
  };

  const handleFetchPlaces = async (input) => {
    setHighlightedIndex(-1);
    try {
      const response = await api.getPlaces({ input: input });
      if (response.status === 1) {
        setResultedPlaces(response.data);
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      console.error("Error fetching places:", error);
      toast.error("Failed to fetch places");
    }
  };

  const handleSelectLocation = (place) => {
    const description = `${place.structuredFormat.mainText.text}, ${place.structuredFormat.secondaryText.text}`;
    setInputValue(description);
    // setSelectedLocation(place);
    setResultedPlaces([]);
    getPlacecDetails(place);
    setHighlightedIndex(-1);
  };

  const getPlacecDetails = async (place) => {
    try {
      const response = await api.getPlacesDetails({
        placeId: place.placeId,
      });

      if (response.status === 1) {
        const { latitude, longitude } = response?.data?.location;
        let cityName = response.data.addressComponents?.[0].longText;
        let formattedAddress = response.data.formattedAddress;
        setlocalLocation({
          formatted_address: response.data.formattedAddress,
          city: response.data.addressComponents?.[0].longText,
          lat: parseFloat(latitude),
          lng: parseFloat(longitude),
        });
        await handleConfirmLocation(
          latitude,
          longitude,
          cityName,
          formattedAddress,
        );
        setAddressLoading(false);
      } else {
        // toast.error(response.message);
        setInputValue("");
        seterrorMsg(response.message);
      }
    } catch (error) {
      console.log("Error fetching place details:", error);
    }
  };

  const handleShowModal = () => {
    setShowLocation(false);
    setMapView(false);
  };

  return (
    <>
      {loading ? (
        <Loader screen={"full"} />
      ) : (
        <Dialog open={showLocation} onOpenChange={handleCloseLocation}>
          <DialogOverlay
            className={`${
              theme == "light"
                ? setting.setting?.default_city == null && city?.city == null
                  ? "bg-white/100"
                  : "bg-white/10"
                : setting.setting?.default_city == null && city?.city == null
                  ? "bg-black/100"
                  : "bg-black/10"
            }`}
          />
          <DialogContent onInteractOutside={(e) => e.preventDefault()}>
            <DialogHeader className="text-lg font-extrabold flex-row items-center flex justify-between">
              <div>{t("select_location")}</div>
              <div className="closeButtonBg rounded-full p-[8px] gap-[4px] cursor-pointer">
                <RiCloseFill size={22} onClick={() => handleShowModal()} />
              </div>
            </DialogHeader>
            <div className="flex">
              {!mapView ? (
                <div className="flex flex-col gap-3 w-full">
                  <div className="relative h-[100px]  m-8">
                    <Image
                      src={setting?.setting?.web_settings?.web_logo}
                      fill
                      className=" object-contain"
                      alt="logo"
                    />
                  </div>
                  <h2 className=" text-center font-extrabold text-lg">
                    {t("select_delivery_location")}
                  </h2>
                  <button
                    className="w-full m-auto rounded-lg primaryBorder p-1 font-medium flex items-center justify-center gap-1 mt-7"
                    onClick={handleViewMap}
                  >
                    <FaLocationCrosshairs /> {t("use_my_current_location")}
                  </button>
                  <div className="flex items-center justify-between my-4 gap-2">
                    <hr className="flex-grow border-t-2 border-solid border-gray-300" />
                    <span className="  font-bold text-base">OR</span>
                    <hr className="flex-grow border-t-2 border-solid border-gray-300" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div>
                      <input
                        ref={inputDomRef}
                        type="text"
                        name=""
                        id=""
                        value={inputValue}
                        placeholder={t("select_delivery_location")}
                        className="w-full p-2 buttonBackground outline-none rounded-lg text-sm placeholder:text-center placeholder:textColor"
                        onFocus={() => {
                          // setcurrLocationClick(false);
                          // setisInputFields(true);
                        }}
                        onChange={(event) => {
                          handleInputChange(event);
                        }}
                        onBlur={() => {
                          // setisInputFields(false);
                        }}
                      />
                    </div>
                    <div className="w-full relative">
                      {resultedPlaces?.suggestions?.length > 0 && (
                        <div
                          className="absolute z-10 w-full bodyBackgroundColor  rounded-lg shadow-lg max-h-[200px] overflow-y-auto"
                          role="listbox"
                        >
                          {resultedPlaces?.suggestions?.map((item, index) => (
                            <div
                              role="option"
                              key={index}
                              className={`p-2 cursor-pointer transition-colors duration-150 ${
                                highlightedIndex === index
                                  ? "bg-blue-500 text-white"
                                  : "bodyBackgroundColor hover:bg-gray-100 hover:text-[#141a1f]"
                              }`}
                              onClick={() =>
                                handleSelectLocation(item.placePrediction)
                              }
                            >
                              <div className="font-medium">
                                {
                                  item?.placePrediction.structuredFormat
                                    .mainText.text
                                }
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 w-full">
                  <div className="w-full flex flex-col gap-4">
                    {/* <input
                      type="text"
                      name=""
                      id=""
                      placeholder={t("search_delivery_location")}
                      className="w-full p-2 buttonBackground outline-none roundΩed-lg text-sm placeholder:text-left placeholder:textColor py-3"
                      onFocus={() => {
                        setcurrLocationClick(false);
                        setisInputFields(true);
                      }}
                      onBlur={() => {
                        setisInputFields(false);
                      }}
                    /> */}
                    {mapView && isLoaded ? (
                      <GoogleMap
                        streetViewControl={false}
                        tilt={true}
                        options={{
                          streetViewControl: false,
                          styles: theme == "dark" ? darkThemeStyles : [],
                        }}
                        zoom={11}
                        center={center}
                        mapContainerStyle={{ height: "400px" }}
                        onClick={handleMapClick}
                      >
                        <MarkerF
                          position={center}
                          draggable={true}
                          onDragStart={onMarkerDragStart}
                          onDragEnd={handleDragEnd}
                        />
                      </GoogleMap>
                    ) : null}
                  </div>

                  <div className="flex flex-col gap-1">
                    <p className="text-center font-semibold text-base">
                      <b>{t("address")} : </b>
                      {addressLoading
                        ? "...."
                        : localLocation.formatted_address}
                    </p>
                  </div>
                  <button
                    onClick={() => handleConfirmLocation()}
                    className="w-full primaryBorder p-1 rounded-lg"
                  >
                    {t("confirm")}
                  </button>
                  <button onClick={() => setMapView(false)} className="w-full ">
                    {t("go_back")}
                  </button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default Location;
