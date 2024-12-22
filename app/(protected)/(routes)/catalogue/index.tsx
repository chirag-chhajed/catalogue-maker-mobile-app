import { AntDesign } from "@expo/vector-icons"; // Add this import
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { View, Pressable } from "react-native";
import { toast } from "sonner-native";

import img from "~/assets/266.png";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";
import { useGetCatalogQuery, useLogoutMutation } from "~/store/features/api";

type CardItem = {
  id: string;
  name: string;
  description: string;
};
const pastelColors = ["#b2e0f8", "#ffd6d6", "#d6ffd6", "#fff4d6"];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isListView, setIsListView] = useState(true);
  const { data, refetch, isLoading } = useGetCatalogQuery();
  const [logout] = useLogoutMutation();
  const cataloguesExist = (data?.length ?? 0) > 0;

  return (
    <View className="flex-1">
      {!cataloguesExist ? (
        <View className="flex-1 items-center justify-center p-4">
          <Image source={img} style={{ width: 200, height: 200 }} />
          <Text className="mb-4 text-center text-gray-600">
            No catalogs yet
          </Text>
          <Pressable className="rounded-md bg-blue-600 px-6 py-3">
            <Link
              href="/(protected)/(routes)/catalogue/create-catalog"
              className="text-center font-semibold text-white"
            >
              Create Your First catalogue
            </Link>
          </Pressable>
        </View>
      ) : (
        <View className="flex-1">
          {/* Search and Filter Section */}
          <View className="flex-row items-center justify-between p-4">
            <View className="relative mr-2 flex-1 flex-row items-center">
              <Input
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search catalogues..."
                style={{ flex: 1 }}
                className=" px-4 py-2 focus:border-blue-500"
              />
              {searchQuery.length > 0 && (
                <Pressable
                  onPress={() => setSearchQuery("")}
                  className="absolute right-2 ml-2"
                >
                  <AntDesign name="closecircle" size={24} color="#666" />
                </Pressable>
              )}
            </View>
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setIsListView(true)}
                className={`rounded-md p-2 ${isListView ? "bg-blue-600" : "bg-gray-200"}`}
              >
                <AntDesign
                  name="bars"
                  size={24}
                  color={isListView ? "white" : "#666"}
                />
              </Pressable>
              <Pressable
                onPress={() => setIsListView(false)}
                className={`rounded-md p-2 ${!isListView ? "bg-blue-600" : "bg-gray-200"}`}
              >
                <AntDesign
                  name="appstore-o"
                  size={24}
                  color={!isListView ? "white" : "#666"}
                />
              </Pressable>
            </View>
          </View>

          {/* Cards Section */}

          <View className=" flex-1 px-4">
            <FlashList
              data={data}
              estimatedItemSize={300}
              ItemSeparatorComponent={() =>
                isListView ? <View className="h-2" /> : <View className="h-4" />
              }
              showsVerticalScrollIndicator={false}
              onRefresh={refetch}
              refreshing={isLoading}
              renderItem={({ item }) =>
                isListView ? (
                  <CompactCard item={item} />
                ) : (
                  <Card
                    key={item.id}
                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                  >
                    <View
                      style={{
                        height: 200,
                        backgroundColor:
                          pastelColors[
                            Math.floor(Math.random() * pastelColors.length)
                          ],
                      }}
                    />
                    <Link
                      href={{
                        pathname: "/catalogue/[id]",
                        params: {
                          id: item.id,
                          title: item.name,
                        },
                      }}
                    >
                      <CardHeader>
                        <CardTitle>{item.name}</CardTitle>
                        <CardDescription>{item.description}</CardDescription>
                      </CardHeader>
                    </Link>
                  </Card>
                )
              }
            />
          </View>
          {/* Floating Action Button */}
          <Link href="/(protected)/(routes)/catalogue/create-catalog" asChild>
            <Pressable className="absolute bottom-6 right-6 h-14 w-14 items-center justify-center rounded-full bg-blue-600 shadow-lg">
              <AntDesign name="plus" size={24} color="white" />
            </Pressable>
          </Link>
        </View>
      )}
    </View>
  );
};

export default Index;

const CompactCard = ({ item }: { item: CardItem }) => (
  <Card className=" flex-row overflow-hidden rounded-lg bg-white shadow-sm">
    <View
      style={{
        width: 100,
        height: 100,
        backgroundColor:
          pastelColors[Math.floor(Math.random() * pastelColors.length) - 1],
      }}
    />
    <Link
      href={{
        pathname: "/catalogue/[id]",
        params: {
          id: item.id,
          title: item.name,
        },
      }}
      className="w-full flex-1 "
    >
      <View className="w-full p-3">
        <CardTitle className="text-base font-bold text-gray-900">
          {item.name}
        </CardTitle>
        <Text className="text-sm text-gray-600" numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </Link>
  </Card>
);
