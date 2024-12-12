import { Feather } from "@expo/vector-icons";
import { Link } from "expo-router";
import { View, Pressable } from "react-native";

import { Text } from "~/components/ui/text";

const menuItems = [
  {
    title: "Home",
    icon: "home",
    href: "/(protected)/catalogue",
  },
  {
    title: "Organization",
    icon: "briefcase",
    href: "/(protected)/organization",
  },
  {
    title: "Details",
    icon: "info",
    href: "/(protected)/details",
  },
];

export default function MenuScreen() {
  return (
    <View className="flex-1 bg-white p-4">
      <View className="mt-10">
        {menuItems.map((item, index) => (
          <Link href={item.href} key={index} asChild>
            <Pressable className="flex-row items-center space-x-3 p-4">
              <Feather name={item.icon as any} size={24} color="black" />
              <Text className="text-lg">{item.title}</Text>
            </Pressable>
          </Link>
        ))}
      </View>
    </View>
  );
}
