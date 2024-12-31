import type React from "react";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, AppState, View } from "react-native";

import { api } from "~/store/features/api";
import { useRefreshQuery } from "~/store/features/api/authApi";
import { useAppDispatch, useOrganizationIdSelector } from "~/store/hooks";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const organizationId = useOrganizationIdSelector();
  const [shouldFetch, setShouldFetch] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldFetch(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [organizationId]);

  const { isLoading } = useRefreshQuery(
    {
      organizationId,
    },
    {
      skip: !shouldFetch,
    },
  );

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
        // console.log("AppState", appState.current);
      },
    );

    return () => {
      subscription.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#96d0b0" />
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
