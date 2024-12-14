import { MMKV, Mode } from "react-native-mmkv";

export const storage = new MMKV({
  id: "user-preferred-default-org",
  readOnly: false,
  mode: Mode.SINGLE_PROCESS,
});
