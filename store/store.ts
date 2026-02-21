// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./app/appSlice";
import { privacyPolicyApi } from "./settings/privacyPolicyApi";
import { adminsApi } from "./admins/adminsApi";
import { rolesApi } from "./roles/rolesApi";
import { permissionsApi } from "./permissions/permissionsApi";
import { authApi } from "./auth/authApi";



export const store = configureStore({
  reducer: {
    app: appReducer,
    [privacyPolicyApi.reducerPath]: privacyPolicyApi.reducer,
    [adminsApi.reducerPath]: adminsApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      privacyPolicyApi.middleware , 
      adminsApi.middleware,
      rolesApi.middleware,
      permissionsApi.middleware,
      authApi.middleware
      ),
   
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;