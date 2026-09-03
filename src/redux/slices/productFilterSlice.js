import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  search: null,
  section_id: null,
  brand_ids: [],
  category_id: null,
  grid_view: true,
  price_filter: null,
  sort_filter: "",
  section_products: null,
  search_sizes: [],
  seller_id: "",
  country_id: "",
  search_product: [],
  selectedCategories: [],
  searchedCategory: "",
  listing_source: "all",
  category_slug: "",
  categoryBreadcrumb: [],
};

export const productFilterReducer = createSlice({
  name: "productFilter",
  initialState,
  reducers: {
    setFilterSearch: (state, action) => {
      state.search = action.payload.data;
    },
    setFilterSection: (state, action) => {
      state.section_id = action.payload.data;
    },
    setFilterBrands: (state, action) => {
      state.brand_ids = action.payload.data;
    },
    setFilterCategory: (state, action) => {
      state.category_id = action.payload.data;
    },
    setFilterView: (state, action) => {
      state.grid_view = action.payload.data;
    },
    setFilterMinMaxPrice: (state, action) => {
      state.price_filter = action.payload.data;
    },
    setFilterSort: (state, action) => {
      state.sort_filter = action.payload.data;
    },
    setFilterProducts: (state, action) => {
      state.section_products = action.payload.data;
    },
    setFilterProductSizes: (state, action) => {
      state.search_sizes = action.payload.data;
    },
    setFilterBySeller: (state, action) => {
      state.seller_id = action.payload.data;
    },
    setFilterByCountry: (state, action) => {
      state.country_id = action.payload.data;
    },
    setProductBySearch: (state, action) => {
      state.search_product = action.payload.data;
    },
    setFilterSellers: (state, action) => {
      state.seller_id = action.payload.data;
    },
    clearAllFilter: (state, action) => {
      const { preserveCategory } = action.payload || {};
      state.country_id = "";
      state.brand_ids = [];
      state.seller_id = "";
      // state.category_id = "";
      state.section_id = null;
      state.search = null;
      state.price_filter = null;
      state.search_product = [];
      state.selectedCategories = [];
      state.searchedCategory = "";
      if (!preserveCategory) {
        state.category_id = "";
        state.category_slug = "";
        state.categoryBreadcrumb = [];
        state.listing_source = "all";
      }
    },
    setSelectedCategories: (state, action) => {
      state.selectedCategories = [
        ...state.selectedCategories,
        action.payload.data,
      ];
    },
    setSearchedCategory: (state, action) => {
      state.searchedCategory = action.payload.data;
    },
    setListingSource: (state, action) => {
      state.listing_source = action.payload.data;
    },
    setCategorySlug: (state, action) => {
      state.category_slug = action.payload.data;
    },
    setCategoryBreadcrumb: (state, action) => {
      state.categoryBreadcrumb = action.payload.data;
    },
  },
});

export const {
  setFilterSearch,
  setFilterBrands,
  setFilterCategory,
  setFilterMinMaxPrice,
  setFilterProducts,
  setFilterSection,
  setFilterSort,
  setFilterView,
  setFilterProductSizes,
  setFilterByCountry,
  setFilterBySeller,
  clearAllFilter,
  setProductBySearch,
  setSelectedCategories,
  setSearchedCategory,
  setListingSource,
  setCategorySlug,
  setCategoryBreadcrumb,
} = productFilterReducer.actions;

export default productFilterReducer.reducer;
