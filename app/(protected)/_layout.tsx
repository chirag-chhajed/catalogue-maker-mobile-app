import { Redirect } from "expo-router";
import { Drawer } from "expo-router/drawer";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useAppSelector } from "~/store/hooks";

const ProtectedLayout = () => {
  const { accessToken } = useAppSelector((state) => state.hello);
  if (!accessToken) {
    return <Redirect href="/" />;
  }
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer screenOptions={{ headerShown: false }}>
        <Drawer.Screen
          name="menu"
          options={{
            headerShown: false,
            swipeEnabled: false, // Disable swipe gesture,
          }}
        />
        {/* Wrap existing stack screens */}
        <Drawer.Screen
          name="(routes)"
          options={{
            headerShown: false,
            drawerItemStyle: { display: "none" }, // Hide from drawer list
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
};

export default ProtectedLayout;
