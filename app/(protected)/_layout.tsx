import { Redirect, Stack } from "expo-router";

import { useAppSelector } from "~/store/hooks";

const ProtectedLayout = () => {
  const { accessToken } = useAppSelector((state) => state.hello);
  if (!accessToken) {
    return <Redirect href="/" />;
  }
  return (
    <Stack>
      <Stack.Screen
        name="(routes)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
};

export default ProtectedLayout;
