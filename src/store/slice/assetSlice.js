import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  publicAssets: [],
  myAssets: [],
  loading: false,
  error: null,
};

const assetSlice = createSlice({
  name: "assets",
  initialState,
  reducers: {
    setPublicAssets: (state, action) => {
      state.publicAssets = action.payload;
    },
    setMyAssets: (state, action) => {
      state.myAssets = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearAssets: (state) => {
      state.publicAssets = [];
      state.myAssets = [];
      state.loading = false;
      state.error = null;
    },
  },
});

export const {
  setPublicAssets,
  setMyAssets,
  setLoading,
  setError,
  clearAssets,
} = assetSlice.actions;

export default assetSlice.reducer;
