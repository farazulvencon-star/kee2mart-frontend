import { createSlice } from "@reduxjs/toolkit";
const initialState = {
    status: "fulfill",
    city: {
        formatted_address: "Bypass Location",
        latitude: 23.8103,
        longitude: 90.4125,
        lat: 23.8103,
        lng: 90.4125
    },
};
export const locationReducer = createSlice({
    name: "city",
    initialState,
    reducers: {
        setCity: (state, action) => {
            state.status = "fulfill";
            state.city = action.payload.data;
        }
    }
});

export const { setCity } = locationReducer.actions;
export default locationReducer.reducer;