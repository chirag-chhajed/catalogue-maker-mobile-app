import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Link, router } from "expo-router";
import { View, Pressable } from "react-native";

import { Badge } from "~/components/ui/badge";
import { Card, CardTitle } from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { cn } from "~/lib/utils";
import { api } from "~/store/features/api";
import { useGetApiV1OrganisationQuery } from "~/store/features/api/newApis";
import { useOrganitionIdDispatch, useUserState } from "~/store/hooks";
import { store } from "~/store/store";

const Organization = () => {
  const {
    data: organizations,
    refetch,
    isLoading,
  } = useGetApiV1OrganisationQuery();
  const organizationsExist = (organizations?.length ?? 0) > 0;
  const { changeOrganizationId } = useOrganitionIdDispatch();
  const user = useUserState();

  return (
    <View className="flex-1 bg-background">
      {!organizationsExist ? (
        <View className="flex-1 items-center justify-center p-4">
          <View className="mb-8 h-40 w-40 items-center justify-center rounded-full bg-primary/10">
            <AntDesign name="team" size={64} color="#2563eb" />
          </View>
          <Text className="mb-2 text-xl font-bold text-foreground">
            No Organizations Yet
          </Text>
          <Text className="mb-8 text-center text-muted-foreground">
            Create your first organization to start collaborating with your team
          </Text>
          <Link href="/(protected)/(routes)/organization/create-form" asChild>
            <Pressable className="w-full rounded-lg bg-primary px-6 py-3">
              <Text className="text-center font-semibold text-primary-foreground">
                Create Organization
              </Text>
            </Pressable>
          </Link>
        </View>
      ) : (
        <View className="flex-1">
          <FlashList
            data={organizations}
            estimatedItemSize={150}
            contentContainerStyle={{ padding: 16 }}
            refreshing={isLoading}
            onRefresh={refetch}
            ItemSeparatorComponent={() => <View className="h-3" />}
            renderItem={({ item: org }) => (
              <Pressable
                onPress={() => {
                  if (user?.organizationId === org.orgId) return;
                  store.dispatch(api.util.resetApiState());
                  changeOrganizationId(org.orgId);
                  router.dismissAll();
                  router.replace("/(protected)/(routes)/catalogue");
                }}
                key={org.orgId}
              >
                <Card
                  className={cn(
                    "flex-row overflow-hidden bg-card p-4",
                    user?.organizationId === org.orgId
                      ? "border-2 border-primary shadow-lg shadow-primary/20"
                      : "border border-border/50",
                  )}
                >
                  <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Text className="text-lg font-bold text-primary">
                      {org.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center justify-between">
                      <CardTitle className="text-lg font-bold text-foreground">
                        {org.name}
                      </CardTitle>
                      {user?.organizationId === org.orgId && (
                        <Badge
                          variant="default"
                          className="ml-2 bg-primary/10 px-2"
                        >
                          <Text className="text-xs font-medium text-primary">
                            Active
                          </Text>
                        </Badge>
                      )}
                    </View>

                    <Text
                      className="mt-1 text-sm text-muted-foreground"
                      numberOfLines={2}
                    >
                      {org.description}
                    </Text>

                    <View className="mt-3 flex-row items-center justify-between">
                      <Badge
                        variant={org.role === "admin" ? "default" : "secondary"}
                        className="rounded-full px-3 py-0.5"
                      >
                        <Text className="text-xs font-medium capitalize text-primary-foreground">
                          {org.role}
                        </Text>
                      </Badge>

                      <AntDesign
                        name="right"
                        size={16}
                        className="text-muted-foreground"
                      />
                    </View>
                  </View>
                </Card>
              </Pressable>
            )}
          />
        </View>
      )}

      <View className="border-t border-border p-4">
        <Link href="/(protected)/(routes)/organization/join-form" asChild>
          <Pressable className="rounded-lg bg-card p-4">
            <View className="flex-row items-center justify-center">
              <AntDesign name="plus" size={16} className="text-primary" />
              <Text className="ml-2 text-sm font-medium text-primary">
                Join an Organization
              </Text>
            </View>
          </Pressable>
        </Link>
      </View>
    </View>
  );
};

export default Organization;
