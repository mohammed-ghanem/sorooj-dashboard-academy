export interface IUser {
  id: number;
  name: string;
  email: string;
}

export interface IAuthState {
  user: IUser | null;
  token: string | null;
  loading: "idle" | "pending" | "succeeded" | "failed";
  error: string | null;
}