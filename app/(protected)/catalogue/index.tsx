import { AntDesign } from "@expo/vector-icons"; // Add this import
import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useState } from "react";
import { View, Pressable } from "react-native";

import img from "~/assets/266.png";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

const Index = () => {
  const [cataloguesExist, setCataloguesExist] = useState(true); // Changed to true for testing
  const [searchQuery, setSearchQuery] = useState("");

  const pastelColors = ["#b2e0f8", "#ffd6d6", "#d6ffd6", "#fff4d6"];
  const dummyData = [1, 2, 3, 4].map((item, index) => ({
    id: index,
    title: `Catalogue ${item}`,
    description: `Description for catalogue ${item}`,
  }));
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
              href="/(protected)/catalogue/create-catalog"
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
            <Pressable className="rounded-md bg-gray-200 p-2">
              <AntDesign name="filter" size={24} color="#666" />
            </Pressable>
          </View>

          {/* Cards Section */}

          <View className="flex-1">
            <FlashList
              data={dummyData}
              estimatedItemSize={300}
              contentContainerStyle={{ padding: 16 }}
              renderItem={({ item }) => (
                <Card
                  key={item.id}
                  className="mb-4 overflow-hidden rounded-2xl"
                >
                  <View
                    style={{
                      height: 200,
                      backgroundColor:
                        pastelColors[item.id % pastelColors.length],
                    }}
                  />
                  <Link
                    href={{
                      pathname: "/catalogue/[id]",
                      params: {
                        id: item.id,
                        title: item.title,
                      },
                    }}
                  >
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>{item.description}</CardDescription>
                    </CardHeader>
                  </Link>
                </Card>
              )}
            />
          </View>
          {/* Floating Action Button */}
          <Link href="/(protected)/catalogue/create-catalog" asChild>
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
