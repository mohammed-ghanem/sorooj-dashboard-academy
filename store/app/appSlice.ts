import { createSlice } from "@reduxjs/toolkit";

const appSlice = createSlice({
  name: "app",
  initialState: {
    sessionReady: false,
  },
  reducers: {
    setSessionReady: (state) => {
      state.sessionReady = true;
    },
  },
});

export const { setSessionReady } = appSlice.actions;
export default appSlice.reducer;
