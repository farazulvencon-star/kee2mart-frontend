import * as Slider from "@radix-ui/react-slider";
import Skeleton from "react-loading-skeleton";
import { useState } from "react";
import { useSelector } from "react-redux";

const PriceSlider = ({
  values,
  setValues,
  minPrice,
  maxPrice,
  setTempMinPrice,
  setTempMaxPrice,
}) => {
  const [showMinTooltips, setMinShowTooltips] = useState(false);
  const [showMaxTooltips, setMaxShowTooltips] = useState(false);

  const setting = useSelector((state) => state?.Setting?.setting);

  const currentValues = values?.length === 2 ? values : [minPrice, maxPrice];

  return (
    <div className="w-full">
      {minPrice === null ||
      maxPrice === null ||
      typeof minPrice === "undefined" ||
      typeof maxPrice === "undefined" ? (
        <Skeleton height={15} />
      ) : (
        <div className="relative">
          <Slider.Root
            defaultValue={[minPrice, maxPrice]}
            min={minPrice}
            max={maxPrice}
            value={currentValues}
            step={0.01}
            className="relative flex h-15 w-full touch-none select-none items-center"
            onValueChange={(newValues) => {
              setValues(newValues);
            }}
            onValueCommit={(newValues) => {
              setTempMinPrice(newValues[0]);
              setTempMaxPrice(newValues[1]);
              setMinShowTooltips(false);
              setMaxShowTooltips(false);
            }}
          >
            <Slider.Track className="relative h-[15px] w-full grow rounded-full bg-white border border-gray-200">
              <Slider.Range className="absolute h-full rounded-full bg-green-600" />
            </Slider.Track>

            <Slider.Thumb
              className="w-[25px] h-[25px] absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full primaryBackColor border-4 border-white drop-shadow-md focus:outline-none cursor-pointer group"
              onMouseEnter={() => setMinShowTooltips(true)}
              onMouseLeave={() => setMinShowTooltips(false)}
              onFocus={() => setMinShowTooltips(true)}
              onBlur={() => setMinShowTooltips(false)}
            >
              {showMinTooltips && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-base p-2 rounded whitespace-nowrap z-10 ">
                  {setting?.currency}
                  {currentValues[0]?.toFixed(2)}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </Slider.Thumb>

            <Slider.Thumb
              className="w-[25px] h-[25px] absolute top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full primaryBackColor border-4 border-white drop-shadow-md focus:outline-none cursor-pointer group"
              onMouseEnter={() => setMaxShowTooltips(true)}
              onMouseLeave={() => setMaxShowTooltips(false)}
              onFocus={() => setMaxShowTooltips(true)}
              onBlur={() => setMaxShowTooltips(false)}
            >
              {showMaxTooltips && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-base p-2 rounded whitespace-nowrap z-10">
                  {setting?.currency}
                  {currentValues[1]?.toFixed(2)}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                </div>
              )}
            </Slider.Thumb>
          </Slider.Root>
        </div>
      )}
    </div>
  );
};

export default PriceSlider;
