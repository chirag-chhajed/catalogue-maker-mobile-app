import { Stack } from "expo-router";

const ProtectedLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default ProtectedLayout;
