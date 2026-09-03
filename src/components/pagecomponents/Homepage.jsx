import React, { useEffect, useState } from "react";
import Home from "@/components/homepage/Home";
import * as api from "@/api/apiRoutes";
import { setShop } from "@/redux/slices/shopSlice";
import { useSelector, useDispatch } from "react-redux";
import { useQuery } from "@tanstack/react-query";

import Loader from "../loader/Loader";
import Layout from "../layout/Layout";
// import { resetSelectedCategories } from '@/redux/slices/productFilterSlice'
import { useRouter } from "next/router";
import { clearAllFilter } from "@/redux/slices/productFilterSlice";
import HomeSkeleton from "../homepage/HomeSkeleton";


const Homepage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const setting = useSelector((state) => state.Setting.setting);
  const isRefetch = useSelector((state) => state.Shop.isRefetch)
  const language = useSelector((state) => state.Language.selectedLanguage);
  const city = useSelector((state) => state.City.city);
  const activeModuleId = useSelector((state) => state.Module.activeModuleId);

  const [loading, setLoading] = useState(false);

  useEffect(() => { }, [language?.id]);

  useEffect(() => {
    if (router?.pathname === "/") {
      dispatch(clearAllFilter());
    }
  }, []);
  

  
  const { isLoading, data, isFetching,refetch } = useQuery({
    queryKey: ["shopData", city?.latitude, city?.longitude, language?.id,isRefetch, activeModuleId],
    queryFn: async () => {
      const latitude = parseFloat(city?.latitude);
      const longitude = parseFloat(city?.longitude);
      const response = await api.getShop({ latitude, longitude, module_id: activeModuleId });

      // Only update redux on a valid response so a partial/empty/errored payload
      // can't overwrite good data (which would make the homepage slider and
      // other sections disappear until a manual refresh).
      if (response?.status == 1 && response?.data) {
        dispatch(setShop({ data: response.data }));
      }

      return response?.data;
    },

    enabled: !!city,

    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });
  
  useEffect(() => {
  if (language?.id) {
    refetch();
  }
}, [language?.id]);

  // Keep redux shop in sync with the query data (covers React Query cache hits
  // when switching module, where queryFn doesn't re-run)
  useEffect(() => {
    if (data) {
      dispatch(setShop({ data }));
    }
  }, [data]);

  const showLoading = isLoading && !data;

  return (
    <div>
      {
        <Layout>
          {showLoading ? (
            <div>
              {" "}
              <HomeSkeleton />
            </div>
          ) : (
            <Home />
          )}
        </Layout>
      }
    </div>
  );
};

export default Homepage;
