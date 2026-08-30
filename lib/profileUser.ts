/* eslint-disable @typescript-eslint/no-explicit-any */

export type ProfileUser = {
  name?: string;
  email?: string;
  avatar?: string | null;
  [key: string]: unknown;
};

export function extractProfileUser(profileData: unknown): ProfileUser | null {
  if (profileData == null || typeof profileData !== "object") return null;

  const payload = profileData as Record<string, any>;
  const user = payload?.data ?? payload?.user ?? payload;

  if (user == null || typeof user !== "object") return null;
  if (!user.email && !user.name) return null;

  return user as ProfileUser;
}
