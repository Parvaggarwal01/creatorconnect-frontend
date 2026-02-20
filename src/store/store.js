import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import assetReducer from "./slice/assetSlice"

const store = configureStore({
  reducer: {
    auth: authReducer,
    asserts: assetReducer
  },
});

export default store;
