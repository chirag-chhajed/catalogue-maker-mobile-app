import { Feather } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { Pressable } from "react-native";

import { Text } from "~/components/ui/text";
import { useDrawerHelper } from "~/lib/useDrawerHelper";

const CatalogueLayout = () => {
  const { openDrawer } = useDrawerHelper();
  return (
    <Stack
    // screenOptions={{
    //   headerRight: () => (
    //     <Pressable onPress={openDrawer} className=" p-3 ">
    //       {/* <Link href="/(protected)/catalogue/create-catalog"> */}
    //       <Feather name="menu" size={24} />
    //       {/* </Link> */}
    //     </Pressable>
    //   ),
    //   headerShadowVisible: false,
    // }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerLeft: () => (
            <Text className="text-3xl font-bold ">Catalogues</Text>
          ),
          headerTitle: "",
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="[id]"
        options={({ route }) => ({
          headerTitle: route.params?.title ?? "Catalogue",
        })}
      />
      <Stack.Screen
        name="create-catalog"
        options={{
          presentation: "modal",
          headerTitle: "Create Catalogue",
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
};

export default CatalogueLayout;
