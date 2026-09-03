import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentStep: 1,
  address: null,
  selectedDate: null,
  timeSlot: null,
  formattedDate: null,
  selectedPaymentMethod: null,
  isWalletChecked: false,
  usedWalletBalance: 0,
  orderNote: "",
  checkoutTotal: 0,
  phonepecheckoutdetails: "",
  orderType: "doorstep",
  prescriptions: [], // [{ file, preview }] — legacy flat list (kept for backward compat)
  // Prescription grouping: each group binds selected cart lines to image(s)
  prescriptionGroups: [], // [{ id, productIds: [variantId], images: [{ file, preview }] }]
  selectedPrescriptionProductIds: [], // variant ids ticked but not yet grouped
  prescriptionGroupSeq: 0, // incrementing id source for groups
};

export const checkoutReducer = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCurrentStep: (state, action) => {
      state.currentStep = action.payload.data;
    },
    setAddress: (state, action) => {
      state.address = action.payload.data;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload.data;
    },
    setTimeSlot: (state, action) => {
      state.timeSlot = action.payload.data;
    },
    setFormateDate: (state, action) => {
      state.formattedDate = action.payload.data;
    },
    setPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload.data;
    },
    setWalletChecked: (state, action) => {
      state.isWalletChecked = action.payload.data;
    },
    setUserWalletBalance: (state, action) => {
      state.usedWalletBalance = action.payload.data;
    },
    setOrderNote: (state, action) => {
      state.orderNote = action.payload.data;
    },
    setCheckoutTotal: (state, action) => {
      state.checkoutTotal = action.payload.data;
    },
    setPhonePeCheckoutDetails: (state, action) => {
      state.phonepecheckoutdetails = action.payload;
    },
    setOrderType: (state, action) => {
      state.orderType = action.payload.data;
    },
    addPrescriptions: (state, action) => {
      // action.payload.data = array of { file, preview }
      state.prescriptions.push(...action.payload.data);
    },
    removePrescription: (state, action) => {
      state.prescriptions.splice(action.payload.index, 1);
    },
    clearPrescriptions: (state) => {
      state.prescriptions = [];
      state.prescriptionGroups = [];
      state.selectedPrescriptionProductIds = [];
      state.prescriptionGroupSeq = 0;
    },
    // ---- Prescription grouping ----
    togglePrescriptionSelection: (state, action) => {
      const id = action.payload.productId;
      // Ignore if this line is already part of a group (its checkbox is locked).
      const inGroup = state.prescriptionGroups.some((g) =>
        g.productIds.includes(id)
      );
      if (inGroup) return;
      const idx = state.selectedPrescriptionProductIds.indexOf(id);
      if (idx >= 0) state.selectedPrescriptionProductIds.splice(idx, 1);
      else state.selectedPrescriptionProductIds.push(id);
    },
    selectPrescriptionProducts: (state, action) => {
      const ids = action.payload.productIds || [];
      ids.forEach((id) => {
        const inGroup = state.prescriptionGroups.some((g) =>
          g.productIds.includes(id)
        );
        if (!inGroup && !state.selectedPrescriptionProductIds.includes(id)) {
          state.selectedPrescriptionProductIds.push(id);
        }
      });
    },
    clearPrescriptionSelection: (state) => {
      state.selectedPrescriptionProductIds = [];
    },
    addPrescriptionGroup: (state, action) => {
      const images = action.payload.images || []; // [{ file, preview }]
      const productIds = [...state.selectedPrescriptionProductIds];
      if (productIds.length === 0 || images.length === 0) return;
      state.prescriptionGroupSeq += 1;
      state.prescriptionGroups.push({
        id: state.prescriptionGroupSeq,
        productIds,
        images,
      });
      state.selectedPrescriptionProductIds = [];
    },
    removePrescriptionGroup: (state, action) => {
      state.prescriptionGroups = state.prescriptionGroups.filter(
        (g) => g.id !== action.payload.id
      );
    },
    addImagesToGroup: (state, action) => {
      const g = state.prescriptionGroups.find(
        (x) => x.id === action.payload.id
      );
      if (g) g.images.push(...(action.payload.images || []));
    },
    removeImageFromGroup: (state, action) => {
      const { id, index } = action.payload;
      const g = state.prescriptionGroups.find((x) => x.id === id);
      if (!g) return;
      g.images.splice(index, 1);
      // Drop the whole group if it no longer has any image.
      if (g.images.length === 0) {
        state.prescriptionGroups = state.prescriptionGroups.filter(
          (x) => x.id !== id
        );
      }
    },
    // Called when a product is removed from the cart so it doesn't linger in a group.
    removeProductFromPrescriptions: (state, action) => {
      const id = action.payload.productId;
      state.selectedPrescriptionProductIds =
        state.selectedPrescriptionProductIds.filter((x) => x !== id);
      state.prescriptionGroups.forEach((g) => {
        g.productIds = g.productIds.filter((x) => x !== id);
      });
      state.prescriptionGroups = state.prescriptionGroups.filter(
        (g) => g.productIds.length > 0
      );
    },
    clearCheckout: (state) => {
      const phonepecheckoutdetails = state.phonepecheckoutdetails;
      Object.assign(state, {
        currentStep: 1,
        address: null,
        selectedDate: null,
        timeSlot: null,
        formattedDate: null,
        selectedPaymentMethod: null,
        isWalletChecked: false,
        usedWalletBalance: 0,
        orderNote: "",
        checkoutTotal: 0,
        orderType: "doorstep",
        prescriptions: [],
        prescriptionGroups: [],
        selectedPrescriptionProductIds: [],
        prescriptionGroupSeq: 0,
        phonepecheckoutdetails, // preserve the existing value
      });
    },
  },
});

export const {
  setAddress,
  setSelectedDate,
  setFormateDate,
  setPaymentMethod,
  setCurrentStep,
  setTimeSlot,
  setWalletChecked,
  setOrderNote,
  clearCheckout,
  setCheckoutTotal,
  setUserWalletBalance,
  setPhonePeCheckoutDetails,
  setOrderType,
  addPrescriptions,
  removePrescription,
  clearPrescriptions,
  togglePrescriptionSelection,
  selectPrescriptionProducts,
  clearPrescriptionSelection,
  addPrescriptionGroup,
  removePrescriptionGroup,
  addImagesToGroup,
  removeImageFromGroup,
  removeProductFromPrescriptions,
} = checkoutReducer.actions;

export default checkoutReducer.reducer;
