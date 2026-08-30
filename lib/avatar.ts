/** Default admin avatar when profile has no uploaded image. */
export const DEFAULT_AVATAR = "/assets/images/default-avatar.svg";

export function getAvatarSrc(avatar?: string | null) {
  const value = typeof avatar === "string" ? avatar.trim() : "";
  return value || DEFAULT_AVATAR;
}
