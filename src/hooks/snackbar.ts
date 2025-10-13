import { atom, useRecoilState } from "recoil";

// useAuthTypeData -> signin/signup
const snackbarMsgAtom = atom<{ msg: string, type?: "info" | "error" | "warn" | "success" } | null>({
  key: "snackbarMsgAtom",
  default: null,
});

export function useSnackbarMsg() {
  const [snackbarMsg, setSnackbarMsg] = useRecoilState(snackbarMsgAtom);
  return [
    snackbarMsg,
    setSnackbarMsg
  ] as const;
} 