/**
 * Decodes a JWT token and returns the payload.
 * Provides a simple base64 decoding for the payload part.
 */
export const decodeJwt = (token: string): any => {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Error decoding JWT:", error);
    return null;
  }
};

export interface UserClaims {
  userName?: string;
  email?: string;
  fullName?: string;
  sub?: string; // userId
  role?: string | string[];
  cinemaId?: string;
}

export const getUserInfoFromToken = (token: string): UserClaims | null => {
  const payload = decodeJwt(token);
  if (!payload) return null;

  // Admin tokens may expose `cinemaId` under different claim keys depending on the identity provider.
  // Keep this resilient so manager/staff pages can always resolve cinema context.
  const cinemaIdValue =
    payload.cinemaId ??
    payload["cinemaId"] ??
    payload["CinemaId"] ??
    payload["cinemaID"] ??
    payload["cinema_id"] ??
    payload["CinemaID"] ??
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/cinemaId"] ??
    payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/cinemaID"];

  const cinemaId =
    cinemaIdValue ??
    (() => {
      if (payload == null || typeof payload !== "object") return undefined;
      const key = Object.keys(payload).find((k) => k.toLowerCase() === "cinemaid" || k.toLowerCase().endsWith("cinemaid"));
      if (!key) return undefined;
      const v = (payload as Record<string, unknown>)[key];
      return typeof v === "string" ? v : v != null ? String(v) : undefined;
    })();

  return {
    userName: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || payload.unique_name || payload.name,
    email: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || payload.email,
    fullName: payload.given_name || payload.name || payload.fullName,
    sub: payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
    role: payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || payload.role,
    cinemaId,
  };
};
