import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { isPast } from "date-fns";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator } from "react-native";
import { toast } from "sonner-native";

import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { THEME_COLORS } from "~/lib/constants";
import { cn } from "~/lib/utils";
import {
  usePostApiV1InvitationMutation,
  useGetApiV1InvitationQuery,
  useGetApiV1OrganisationUsersQuery,
  useDeleteApiV1OrganisationRemoveUserByUserIdMutation,
} from "~/store/features/api/newApis";
import { useUserState } from "~/store/hooks";

const Invitations = () => {
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [tab, setTab] = useState<"invitations" | "users">("invitations");
  const [create, { isLoading }] = usePostApiV1InvitationMutation();

  const { role: userRole, id } = useUserState();
  const {
    data: users,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useGetApiV1OrganisationUsersQuery({
    skip: userRole !== "admin",
  });
  const {
    data: invitations,
    isLoading: refreshing,
    refetch,
  } = useGetApiV1InvitationQuery();

  if (refreshing || isUsersLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color={THEME_COLORS.primary} />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background p-4">
      <View className="mb-6 rounded-xl bg-card p-4">
        <Text className="font-mono text-xl font-bold text-foreground">
          Create Invitation
        </Text>
        <View className="mt-4">
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
        </View>
        <Button
          disabled={isLoading}
          onPress={() => {
            toast.promise(
              create({
                body: {
                  role,
                },
              }).unwrap(),
              {
                success: (res) => {
                  Clipboard.setStringAsync(res.inviteCode);
                  return "Created and Copied to Clipboard";
                },
                loading: "Creating invitation...",
                error: "Failed to create invitation",
              },
            );
          }}
          className="mt-6 w-full rounded-lg bg-primary py-3"
        >
          <Text className="font-mono font-semibold text-primary-foreground">
            Generate Invitation
          </Text>
        </Button>
      </View>

      <Tabs value={tab} onValueChange={setTab} className="flex-1">
        <TabsList className="mb-4 flex-row">
          <TabsTrigger className="flex-1" value="invitations">
            <Text className="font-mono text-sm font-medium text-foreground">
              Invitations
            </Text>
          </TabsTrigger>
          {userRole === "admin" ? (
            <TabsTrigger className="flex-1" value="users">
              <Text className="font-mono text-sm font-medium text-foreground">
                Users
              </Text>
            </TabsTrigger>
          ) : null}
        </TabsList>

        <TabsContent value="invitations" className="flex-1">
          {invitations?.length && invitations.length > 0 ? (
            <FlashList
              data={invitations}
              renderItem={({ item }) => <InvitationCard item={item} />}
              estimatedItemSize={100}
              ItemSeparatorComponent={() => <View className="h-2" />}
              contentContainerClassName="pb-4"
              refreshing={refreshing}
              onRefresh={refetch}
              keyExtractor={(item) => item.code}
            />
          ) : (
            <Text className="text-muted-foreground">No invitations</Text>
          )}
        </TabsContent>

        <TabsContent value="users" className="flex-1">
          <FlashList
            data={users}
            renderItem={({ item }) => <UserCard item={item} />}
            estimatedItemSize={100}
            ItemSeparatorComponent={() => <View className="h-2" />}
            contentContainerClassName="pb-4"
            refreshing={isUsersLoading}
            onRefresh={refetchUsers}
            keyExtractor={(item) => item.userId}
          />
        </TabsContent>
      </Tabs>
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
      <Label
        nativeID={`label-for-${value}`}
        onPress={onLabelPress}
        className="font-mono text-sm text-foreground"
      >
        {value.toUpperCase()}
      </Label>
    </View>
  );
}

const InvitationCard = ({
  item,
}: {
  item: {
    code: string;
    role: string;
    createdBy: string;
    createdAt: number;
    expiresAt: number;
    usedBy?: string;
    usedAt?: number;
  };
}) => {
  const isDisabled = isPast(item.expiresAt) || item.usedAt;

  return (
    <View
      className={cn(
        "rounded-lg border border-border bg-card p-4",
        isDisabled && "opacity-50",
      )}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-mono text-base font-medium text-foreground">
            {item.code}
          </Text>
          <Text className="mt-1 font-mono text-sm text-muted-foreground">
            Role: {item.role}
          </Text>
          <Text className="mt-1 font-mono text-xs text-muted-foreground">
            Status: {item.usedAt ? "Used" : "Active"}
          </Text>
        </View>

        {!isDisabled ? (
          <Pressable
            onPress={async () => {
              await Clipboard.setStringAsync(item.code);
              toast.success("Copied to clipboard");
            }}
            className="rounded-full p-2 active:bg-muted"
          >
            <AntDesign
              name="copy1"
              size={20}
              color={THEME_COLORS.mutedForeground}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
};

const UserCard = ({
  item,
}: {
  item: {
    name: string;
    userId: string;
    email: string;
    createdAt: number;
    updatedAt: number;
  };
}) => {
  const { id } = useUserState();
  const isCurrentUser = item.userId === id;
  const [removeUser, { isLoading: isRemoveUserLoading }] =
    useDeleteApiV1OrganisationRemoveUserByUserIdMutation();
  return (
    <View className="rounded-lg border border-border bg-card p-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="font-mono text-base font-medium text-foreground">
            {item.name}
          </Text>
          <Text className="mt-1 font-mono text-sm text-muted-foreground">
            {item.email}
          </Text>
          {isCurrentUser ? (
            <Text className="mt-1 font-mono text-xs text-primary">Admin</Text>
          ) : null}
        </View>

        {!isCurrentUser && (
          <Pressable
            onPress={() => {
              // Add remove user logic here
              toast.promise(
                removeUser({
                  userId: item.userId,
                }).unwrap(),
                {
                  loading: "Removing user...",
                  success: "User removed successfully",
                  error: "Failed to remove user",
                },
              );
            }}
            className="rounded-full p-2 active:bg-destructive/10"
          >
            <AntDesign
              name="close"
              size={20}
              color={THEME_COLORS.destructive}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};
