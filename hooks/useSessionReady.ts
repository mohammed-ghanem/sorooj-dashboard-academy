import { useSelector } from "react-redux";
import { RootState } from "@/store/store";

export const useSessionReady = () =>
  useSelector((state: RootState) => state.app.sessionReady);
