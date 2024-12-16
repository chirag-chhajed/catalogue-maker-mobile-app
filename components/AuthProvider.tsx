import type React from "react";
import { useEffect, useRef, useState } from "react";
import { Text } from "react-native";
import { AppState } from "react-native";
import { api, useRefreshQuery } from "~/store/features/api";
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

  const { isLoading, data } = useRefreshQuery(
    {
      organizationId,
    },
    {
      skip: !shouldFetch,
    },
  );
  // console.log("isLoading", data);

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

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  return <>{children}</>;
};

export default AuthProvider;
