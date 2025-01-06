import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link, router } from "expo-router";
import { View, ScrollView, Pressable, TouchableOpacity } from "react-native";

import img from "~/assets/266.png";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Text } from "~/components/ui/text";
import { useGetOrgsQuery } from "~/store/features/api/organizationApi";
import { useOrganitionIdDispatch } from "~/store/hooks";

const Index = () => {
  // const [organizationsExist, setOrganizationsExist] = useState(true);
  const { data: organizations, isLoading, refetch } = useGetOrgsQuery();
  const organizationsExist = (organizations?.length ?? 0) > 0;
  const { changeOrganizationId } = useOrganitionIdDispatch();
  if (isLoading) {
    return <Text>Loading...</Text>;
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
                    changeOrganizationId(org.id);
                    router.replace("/(protected)/(routes)/catalogue");
                  }}
                  key={org.id}
                >
                  <Card className="mb-4 flex w-full flex-row items-end justify-between py-3">
                    <View>
                      <CardHeader>
                        <CardTitle>{org.name}</CardTitle>
                        <CardDescription>{org.description}</CardDescription>
                      </CardHeader>

                      <CardFooter>
                        <Badge
                          variant={
                            org.role === "admin" ? "default" : "secondary"
                          }
                        >
                          <Text className="capitalize">{org.role}</Text>
                        </Badge>
                      </CardFooter>
                    </View>
                  </Card>
                </TouchableOpacity>
              )}
            />
          </View>
        </ScrollView>
      )}

      <View className="self-center border-t border-gray-200 py-4">
        <Link href="/(protected)/(routes)/organization/join-form">
          <Text className="text-center text-blue-600 underline underline-offset-2">
            Have an invite code to join an organization?
          </Text>
        </Link>
      </View>
    </View>
  );
};

export default Index;
