import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { toast } from "sonner-native";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import {
  useCreateInvitationMutation,
  useGetInvitationsQuery,
} from "~/store/features/api";

const Invitations = () => {
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [create, { isLoading }] = useCreateInvitationMutation();
  const {
    data: invitations,
    isLoading: refreshing,
    refetch,
  } = useGetInvitationsQuery();
  return (
    <View className="flex-1 bg-gray-50 p-4">
      <View className="mb-6">
        <Text className="mb-4 text-xl font-bold text-gray-900">
          Create Invitation
        </Text>
        <RadioGroup value={role} onValueChange={setRole} className="gap-3">
          <RadioGroupItemWithLabel
            value="editor"
            onLabelPress={() => setRole("editor")}
          />
          <RadioGroupItemWithLabel
            value="viewer"
            onLabelPress={() => setRole("viewer")}
          />
        </RadioGroup>
        <Button
          disabled={isLoading}
          onPress={() => {
            toast.promise(create({ role }).unwrap(), {
              success: (res) => {
                Clipboard.setStringAsync(res.inviteCode);
                return "Created and Copied to Clipboard";
              },
              loading: "Creating invitation...",
              error: "Failed to create invitation",
            });
          }}
          className="mt-4 mt-4 w-full rounded-md bg-blue-600 py-3"
        >
          <Text className="font-semibold text-white">Generate Invitation</Text>
        </Button>
      </View>

      <View className="flex-1">
        <Text className="mb-4 text-xl font-bold text-gray-900">
          Active Invitations
        </Text>
        <FlashList
          data={invitations}
          renderItem={({ item }) => <InvitationCard item={item} />}
          estimatedItemSize={100}
          ItemSeparatorComponent={() => <View className="h-2" />}
          contentContainerClassName="pb-4"
          refreshing={refreshing}
          onRefresh={refetch}
        />
      </View>
    </View>
  );
};

export default Invitations;

function RadioGroupItemWithLabel({
  value,
  onLabelPress,
}: {
  value: string;
  onLabelPress: () => void;
}) {
  return (
    <View className="flex-row items-center gap-2">
      <RadioGroupItem aria-labelledby={`label-for-${value}`} value={value} />
      <Label nativeID={`label-for-${value}`} onPress={onLabelPress}>
        {value.toUpperCase()}
      </Label>
    </View>
  );
}

const InvitationCard = ({
  item,
}: {
  item: {
    expiresAt: boolean;
    role: "editor" | "viewer";
    status: "active" | "accepted" | "rejected";
    inviteCode: string;
    id: string;
  };
}) => {
  const isDisabled = item.expiresAt || item.status !== "active";

  return (
    <View
      className={`mb-2 rounded-lg border border-gray-200 bg-white p-4 ${
        isDisabled ? "opacity-50" : ""
      }`}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-base font-medium text-gray-900">
            {item.inviteCode}
          </Text>
          <Text className="mt-1 text-sm capitalize text-gray-600">
            Role: {item.role}
          </Text>
          <Text className="mt-1 text-xs capitalize text-gray-500">
            Status: {item.status}
          </Text>
        </View>

        {!isDisabled ? (
          <Pressable
            onPress={async () => {
              await Clipboard.setStringAsync(item.inviteCode);
              toast.success("Copied to clipboard");
            }}
            className="rounded-full p-2 active:bg-gray-100"
          >
            <AntDesign name="copy1" size={20} color="#4B5563" />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};
