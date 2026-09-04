export type Portal = "admin" | "doctor";

const ADMIN_API_PREFIX = "/dashboard-api/v1";
const DOCTOR_API_PREFIX = "/doctor-api/v1";
const ADMIN_DEV_PORT = "3001";
const DOCTOR_DEV_PORT = "3010";

function getPortalFromLocation(): Portal | null {
  if (typeof window === "undefined") return null;

  const { port, hostname } = window.location;
  if (port === DOCTOR_DEV_PORT || hostname.startsWith("doctor.")) {
    return "doctor";
  }
  if (port === ADMIN_DEV_PORT) {
    return "admin";
  }

  return null;
}

export function getPortal(): Portal {
  const fromLocation = getPortalFromLocation();
  if (fromLocation) return fromLocation;

  const value = process.env.NEXT_PUBLIC_PORTAL?.trim().toLowerCase();
  return value === "doctor" ? "doctor" : "admin";
}

export function isDoctorPortal(): boolean {
  return getPortal() === "doctor";
}

export function isAdminPortal(): boolean {
  return getPortal() === "admin";
}

export function getApiPrefix(): string {
  const portal = getPortalFromLocation() ?? getPortal();
  if (portal === "doctor") return DOCTOR_API_PREFIX;
  return ADMIN_API_PREFIX;
}

/** Doctor API expects HTTP PUT. Admin keeps POST + `_method=PUT` for FormData. */
export function asResourceUpdate(data: FormData): {
  method: "put" | "post";
  data: FormData;
} {
  if (isDoctorPortal()) {
    return { method: "put", data };
  }
  if (!data.has("_method")) {
    data.append("_method", "PUT");
  }
  return { method: "post", data };
}
