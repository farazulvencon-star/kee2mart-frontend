"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import ImagePlaceholder from "../../assets/image-placeholder/image.png";
import { useSelector } from "react-redux";

const ImageWithPlaceholder = ({
  src,
  alt,
  className,
  handleOnClick,
  priority,
  sizes,
  quality,
  width,
  height,
}) => {
  const setting = useSelector((state) => state.Setting);
  const [isLoading, setIsLoading] = useState(!src);
  const [isError, setIsError] = useState(false);

  // NOTE:Change from nextjs Image to regular img to get rid of placeholder image error
  return (
    <Image
      src={
        !src || isLoading || isError
          ? setting?.setting?.web_settings?.placeholder_image
            ? setting?.setting?.web_settings?.placeholder_image
            : ImagePlaceholder
          : src
      }
      alt={alt}
      {...(width && height
        ? { width, height }
        : {fill: true, sizes: sizes || "100vw" })}
      quality={quality}
      priority={priority}
      className={className}
      
      onClick={handleOnClick}
      onLoad={() => {
        setIsLoading(false);
      }}
      onError={() => {
        setIsLoading(false);
        setIsError(true);
      }}
    />
  );
};

export default ImageWithPlaceholder;
