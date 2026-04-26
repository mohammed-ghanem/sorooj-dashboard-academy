// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import appReducer from "./app/appSlice";
import { privacyPolicyApi } from "./settings/privacyPolicyApi";
import { adminsApi } from "./admins/adminsApi";
import { cohortsApi } from "./cohorts/cohortsApi";
import { academicYearsApi } from "./academicYears/academicYearsApi";
import { studyTermsApi } from "./studyTerms/studyTermsApi";
import { rolesApi } from "./roles/rolesApi";
import { permissionsApi } from "./permissions/permissionsApi";
import { authApi } from "./auth/authApi";
import { contactsApi } from "./settings/contactsApi";
import { termsAndConditionsApi } from "./settings/termsAndConditions";
import { deleteAccountApi } from "./settings/deleteAcoount";
import { subjectsApi } from "./subjects/subjectsApi";
import { studentsApi } from "./students/studentsApi";
import { appContactsApi } from "./settings/appContactsApi";
import { doctorsApi } from "./doctors/doctorsApi";



export const store = configureStore({
  reducer: {
    app: appReducer,
    [privacyPolicyApi.reducerPath]: privacyPolicyApi.reducer,
    [appContactsApi.reducerPath]: appContactsApi.reducer,
    [termsAndConditionsApi.reducerPath]: termsAndConditionsApi.reducer,
    [deleteAccountApi.reducerPath]: deleteAccountApi.reducer,
    [adminsApi.reducerPath]: adminsApi.reducer,
    [cohortsApi.reducerPath]: cohortsApi.reducer,
    [academicYearsApi.reducerPath]: academicYearsApi.reducer,
    [studyTermsApi.reducerPath]: studyTermsApi.reducer,
    [permissionsApi.reducerPath]: permissionsApi.reducer,
    [rolesApi.reducerPath]: rolesApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    [subjectsApi.reducerPath]: subjectsApi.reducer,
    [studentsApi.reducerPath]: studentsApi.reducer,
    [doctorsApi.reducerPath]: doctorsApi.reducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      privacyPolicyApi.middleware ,
      appContactsApi.middleware,
      termsAndConditionsApi.middleware,
      deleteAccountApi.middleware,
      adminsApi.middleware,
      cohortsApi.middleware,
      academicYearsApi.middleware,
      studyTermsApi.middleware,
      rolesApi.middleware,
      permissionsApi.middleware,
      authApi.middleware,
      contactsApi.middleware,
      subjectsApi.middleware,
      studentsApi.middleware,
      doctorsApi.middleware,
      ),
   
});

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch;