import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    modules: [],
    activeModuleId: null,
};

export const moduleReducer = createSlice({
    name: "module",
    initialState,
    reducers: {
        setModules: (state, action) => {
            state.modules = action.payload.data;
        },
        setActiveModule: (state, action) => {
            state.activeModuleId = action.payload.data;
        },
    },
});

export const { setModules, setActiveModule } = moduleReducer.actions;
export default moduleReducer.reducer;