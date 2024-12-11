import { Stack } from "expo-router";

const ProtectedLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="organization" options={{ headerShown: false }} />
      <Stack.Screen name="catalogue" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProtectedLayout;
