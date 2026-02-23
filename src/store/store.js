import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slice/authSlice";
import assetReducer from "./slice/assetSlice";
import chatReducer from "./slice/chatSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    asserts: assetReducer,
    chat: chatReducer,
  },
});

export default store;
