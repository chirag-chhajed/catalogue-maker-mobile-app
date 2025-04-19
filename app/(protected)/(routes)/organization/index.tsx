import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import {
  View,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AntDesign } from "@expo/vector-icons";

import img from "~/assets/266.png";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useGetApiV1OrganisationQuery } from "~/store/features/api/newApis";
import { useOrganitionIdDispatch } from "~/store/hooks";

const Index = () => {
  const {
    data: organizations,
    isLoading,
    refetch,
  } = useGetApiV1OrganisationQuery();
  const organizationsExist = (organizations?.length ?? 0) > 0;
  const { changeOrganizationId } = useOrganitionIdDispatch();
  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#96d0b0" />
      </View>
    );
  }

  return (
    <View className="flex-1 p-4">
      {!organizationsExist ? (
        <View className="flex-1 items-center justify-center">
          <Image source={img} style={{ width: 200, height: 200 }} />
          <Text className="mb-4 text-center text-gray-600">
            You're not part of any organizations yet.
          </Text>
          {/* <Link className="mt-4" href={"/(protected)/organization/create-form"}> */}
          <Pressable className=" rounded-md bg-blue-600 px-6 py-3">
            <Link
              href="/(protected)/(routes)/organization/create-form"
              className="text-center font-semibold text-white"
            >
              Create Your First Organization
            </Link>
          </Pressable>
          {/* </Link> */}
        </View>
      ) : (
        <ScrollView className="mb-4 flex-1">
          <View className="flex-1">
            <FlashList
              data={organizations}
              estimatedItemSize={150}
              contentContainerStyle={{ padding: 16 }}
              refreshing={isLoading}
              onRefresh={refetch}
              renderItem={({ item: org }) => (
                <TouchableOpacity
                  onPress={() => {
                    changeOrganizationId(org.orgId);
                  }}
                  key={org.orgId}
                >
                  <Card className="mb-4 overflow-hidden border-none bg-card/50 backdrop-blur-sm">
                    <View className="flex-row items-center justify-between p-4">
                      <View className="flex-1">
                        <CardHeader className="p-0">
                          <CardTitle className="text-xl text-foreground">
                            {org.name}
                          </CardTitle>
                          {org.description ? (
                            <CardDescription className="mt-1 text-muted-foreground">
                              {org.description}
                            </CardDescription>
                          ) : null}
                        </CardHeader>

                        <CardFooter className="mt-4 p-0">
                          <Badge
                            variant={
                              org.role === "admin" ? "default" : "secondary"
                            }
                            className={
                              org.role === "admin"
                                ? "bg-primary"
                                : "bg-secondary"
                            }
                          >
                            <Text className="capitalize text-white">
                              {org.role}
                            </Text>
                          </Badge>
                        </CardFooter>
                      </View>
                      <AntDesign
                        name="right"
                        size={20}
                        className="text-muted-foreground"
                      />
                    </View>
                  </Card>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>
      )}

      <View className="self-center border-t border-border py-4">
        <Link href="/(protected)/(routes)/organization/join-form">
          <Text className="text-center text-primary underline underline-offset-2">
            Have an invite code to join an organization?
          </Text>
        </Link>
      </View>
    </View>
  );
};

export default Index;
