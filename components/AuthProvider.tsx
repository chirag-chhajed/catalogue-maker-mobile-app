import type React from "react";
import { useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useMMKVNumber, useMMKVListener } from "react-native-mmkv";

import { api, useRefreshQuery } from "~/store/features/api";
import { useAppDispatch } from "~/store/hooks";
import { storage } from "~/store/storage";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [organizationId] = useMMKVNumber("user_preferred_org");
  useRefreshQuery({
    organizationId,
  });

  useMMKVListener((key) => {
    console.log(`Value for "${key}" changed!`);
  }, storage);

  const appState = useRef(AppState.currentState);
  const dispatch = useAppDispatch();
  const [, setAppStateVisible] = useState(appState.current);

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          dispatch(api.internalActions.onFocus());
        } else if (
          appState.current === "active" &&
          nextAppState.match(/inactive|background/)
        ) {
          dispatch(api.internalActions.onFocusLost());
        }
        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log("AppState", appState.current);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  return <>{children}</>;
};

export default AuthProvider;
