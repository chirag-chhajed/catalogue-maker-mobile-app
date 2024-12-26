import { View, Text } from "react-native";
import { toast } from "sonner-native";

import { Button } from "~/components/ui/button";
import { useLogoutMutation } from "~/store/features/api";
import { useUserState } from "~/store/hooks";

const Profile = () => {
  const { email, name, role } = useUserState() || {};
  const [logout, { isLoading }] = useLogoutMutation();

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="rounded-2xl bg-white p-6 shadow-sm">
        <Text className="mb-6 text-2xl font-bold text-gray-900">Profile</Text>

        <View className="space-y-4">
          <View>
            <Text className="text-sm font-medium text-gray-500">Name</Text>
            <Text className="mt-1 text-base text-gray-900">{name}</Text>
          </View>

          <View>
            <Text className="text-sm font-medium text-gray-500">Email</Text>
            <Text className="mt-1 text-base text-gray-900">{email}</Text>
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-gray-500">Role</Text>
            <Text className="mt-1 text-base capitalize text-gray-900">
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
          <Text>Logout</Text>
        </Button>
      </View>
    </View>
  );
};

export default Profile;
