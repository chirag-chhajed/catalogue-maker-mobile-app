import { View, Text } from "react-native";
import { toast } from "sonner-native";

import { Button } from "~/components/ui/button";
import { usePostApiV1AuthLogoutMutation } from "~/store/features/api/newApis";
import { useUserState } from "~/store/hooks";

const Profile = () => {
  const { email, name, role } = useUserState() || {};
  const [logout, { isLoading }] = usePostApiV1AuthLogoutMutation();

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="rounded-2xl bg-white p-6 shadow-sm">
        <Text className="mb-6 text-2xl font-bold text-gray-900">Profile</Text>

        <View className="flex gap-4">
          <View>
            <Text className=" font-semibold text-gray-600">Name</Text>
            <Text className=" text-base text-gray-900">{name}</Text>
          </View>

          <View>
            <Text className=" font-semibold text-gray-600">Email</Text>
            <Text className=" text-base text-gray-900">{email}</Text>
          </View>

          <View className="mb-6">
            <Text className=" font-semibold text-gray-600">Role</Text>
            <Text className=" text-base capitalize text-gray-900">
              {role?.toUpperCase()}
            </Text>
          </View>
        </View>

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
        >
          <Text className="font-semibold text-white">Logout</Text>
        </Button>
      </View>
    </View>
  );
};

export default Profile;
