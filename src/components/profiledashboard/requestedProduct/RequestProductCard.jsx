import ImageWithPlaceholder from "@/components/image-with-placeholder/ImageWithPlaceholder";
import { t } from "@/utils/translation";
import React from "react";

const RequestProductCard = ({ request }) => {
  return (
    <div className="flex flex-row p-2 border rounded-md ">
      <div className="flex gap-1 w-full">
        <div className="relative shrink-0">
          
          <ImageWithPlaceholder
            src={request?.image_url}
            alt="Requested product image"
            className={"w-[80px] h-[80px] rounded-md object-cover shrink-0"}
            height={500}
            width={500}
          />
        </div>
        
        <div className="flex flex-col w-full min-w-0 overflow-hidden">
          
          <div className=" flex justify-between  text-xs md:text-sm">
             <p className="text-xs textColor ">{request?.created_at}</p>
            <span
              className={`${request?.status == "pending"
                ? "bg-yellow-400"
                : request?.status == "rejected"
                  ? "bg-red-400"
                  : "bg-green-400"
                } text-white  px-2 py-1 rounded`}
            >
              {request?.status == "pending"
                ? t("pending")
                : request?.status == "rejected"
                  ? t("rejected")
                  : t("approved")}
            </span>
          </div>
          
          {request?.description && (
        <p
          className={`text-sm  textColor break-words text-wrap min-w-0"
            } p-2`}
        >
          {request?.description}
        </p>
        
      )}
     
        </div>
      </div>
      

      {request?.admin_notes && (
        <div className="p-2">
          <h3 className="font-semibold mb-2">{t("rejectedReason")}</h3>
          <p className="text-sm textColor">{request?.admin_notes}</p>
        </div>
      )}
    </div>
  );
};

export default RequestProductCard;
