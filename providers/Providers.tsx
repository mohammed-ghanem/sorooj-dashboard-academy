/* eslint-disable @typescript-eslint/no-unused-vars */
// app/providers.tsx
"use client";

import { Provider } from "react-redux";
import { store } from "../store/store";
import { Toaster } from "sonner";
import { useEffect } from "react";
import Cookies from "js-cookie";
import api from "@/services/api";
import { setSessionReady } from "@/store/app/appSlice";


export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // read cookie on client and seed redux synchronously
    const token = Cookies.get("access_token") ?? null;
    const userJson = Cookies.get("user") ?? null;
    let user = null;
    try {
      user = userJson ? JSON.parse(userJson) : null;
    } catch {
      user = null;
    }

    // immediately set axios default header (redundant with interceptor but safe)
    if (token) {
      api.defaults.headers = api.defaults.headers || {};
      api.defaults.headers.common = api.defaults.headers.common || {};
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }
    store.dispatch(setSessionReady());

  }, []);

  return (
    <Provider store={store}>
      {children}
      <Toaster
        position="top-right"
        richColors
        expand={true}
        closeButton
        toastOptions={{
          duration: 4000,
          className: "fontCairo",
        }}
      />
    </Provider>
  );
}