import React from "react";

// Pharmacy icon. Uses currentColor so it follows ModuleButton active/inactive text color.
const PharmacyIcon = (props) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M0 24H12.186C11.431 23.062 11 21.919 11 20.698C11 19.281 11.552 17.949 12.554 16.948L16 13.502V12C16 10.346 14.654 9 13 9H12V7H3.952V9H3C1.346 9 0 10.346 0 12V24ZM11 17H9V19H7V17H5V15H7V13H9V15H11V17Z"
      fill="currentColor"
    />
    <path
      d="M14 2.5C14 1.119 12.881 0 11.5 0H4.5C3.119 0 2 1.119 2 2.5V5H14V2.5Z"
      fill="currentColor"
      fillOpacity="0.6"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.458 16.872L13.967 18.363C12.677 19.653 12.677 21.744 13.967 23.033C15.257 24.322 17.348 24.323 18.637 23.033L20.127 21.542L15.458 16.872Z"
      fill="currentColor"
      fillOpacity="0.6"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18.362 13.968L16.872 15.458L21.541 20.129L23.032 18.638C24.322 17.349 24.322 15.258 23.032 13.968C21.743 12.678 19.652 12.678 18.362 13.968Z"
      fill="currentColor"
      fillOpacity="0.6"
    />
  </svg>
);

export default PharmacyIcon;