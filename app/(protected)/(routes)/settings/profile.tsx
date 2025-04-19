import { View, Text } from "react-native";
import { toast } from "sonner-native";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";

import { Button } from "~/components/ui/button";
import { usePostApiV1AuthLogoutMutation } from "~/store/features/api/newApis";
import { useUserState } from "~/store/hooks";

const Profile = () => {
  const { email, name, role } = useUserState() || {};
  const [logout, { isLoading }] = usePostApiV1AuthLogoutMutation();

  return (
    <LinearGradient
      colors={["#F6F4F0", "#F0EDE8"]}
      className="flex-1 px-4 pt-6"
    >
      <View className="mb-8 items-center">
        <View className="mb-3 h-24 w-24 overflow-hidden rounded-full bg-gray-200">
          <Image
            source={{
              uri: "https://i.pravatar.cc/300",
            }}
            className="h-full w-full"
            contentFit="cover"
            cachePolicy="disk"
          />
        </View>
        <Text className="text-2xl font-bold text-foreground">{name}</Text>
        <Text className="text-sm text-muted-foreground">
          {role?.toUpperCase()}
        </Text>
      </View>

      <View className="rounded-3xl bg-background p-6 shadow-md">
        <View className="space-y-6">
          <View className="border-b border-gray-100 pb-4">
            <Text className="mb-1 text-sm font-medium text-muted-foreground">
              Email
            </Text>
            <Text className="text-base text-foreground">{email}</Text>
          </View>

          <View className="border-b border-gray-100 pb-4">
            <Text className="mb-1 text-sm font-medium text-muted-foreground">
              Role
            </Text>
            <Text className="text-base capitalize text-foreground">{role}</Text>
          </View>
        </View>

        <View className="mt-8">
          <Button
            onPress={() => {
              toast.promise(logout().unwrap(), {
                success: () => "Logged out successfully",
                error: () => "Failed to logout",
                loading: "Logging out...",
              });
            }}
            size="lg"
            variant="destructive"
            disabled={isLoading}
            className="w-full"
          >
            <Text className="font-semibold text-white">Logout</Text>
          </Button>
        </View>
      </View>
    </LinearGradient>
  );
};

export default Profile;
