import { AntDesign } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, Link } from "expo-router";
import { useState } from "react";
import { View, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Share from "react-native-share";

import img from "~/assets/266.png";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Text } from "~/components/ui/text";

// Add this type definition
type CardItem = {
  id: number;
  title: string;
  description: string;
  price: number;
  image: string;
};
export default function DetailsScreen() {
  const { id, title } = useLocalSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const [isListView, setIsListView] = useState(true);
  const [itemsExist, setItemsExist] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: insets.bottom,
    left: 12,
    right: 12,
  };

  const MOCK_CARDS: CardItem[] = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Product ${i + 1}`,
    description:
      "A brief description of the product with more details about features",
    price: Math.floor(Math.random() * 10000) + 1000,
    image: `https://picsum.photos/seed/${i}/800/600`,
  }));

  const pickCameraImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsMultipleSelection: true,
      mediaTypes: "images",
      selectionLimit: 5,
      cameraType: ImagePicker.CameraType.back,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const pickDocImage = async () => {
    const doc = await DocumentPicker.getDocumentAsync({
      multiple: true,
      type: ["image/*"],
    });
    console.log(doc);
    if (!doc.canceled && doc.assets.length <= 5) {
      setImage(doc.assets[0].uri);
    } else if (doc.assets.length > 5) {
      Alert.alert("Limit Exceeded", "You can only select up to 5 images.");
    }
  };

  return (
    <View className="flex-1">
      {!itemsExist ? (
        <View className="flex-1 items-center justify-center p-4">
          <Image source={img} style={{ width: 200, height: 200 }} />
          <Text className="mb-4 text-center text-gray-600">No items yet</Text>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Pressable className="rounded-md bg-gray-200 p-2">
                    <AntDesign name="filter" size={24} color="#666" />
                  </Pressable>
                </DropdownMenuTrigger>
                <DropdownMenuContent insets={contentInsets} className="w-56">
                  <DropdownMenuItem>
                    <Text className="font-medium">Date: New to Old</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="calendar" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Text className="font-medium">Date: Old to New</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="calendar" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Text className="font-medium">Price: High to Low</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="arrowup" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Text className="font-medium">Price: Low to High</Text>
                    <DropdownMenuShortcut>
                      <AntDesign name="arrowdown" size={20} color="#666" />
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </View>
          </View>

          {/* Cards Section */}
          <View className="flex-1 px-4">
            <FlashList
              data={MOCK_CARDS}
              renderItem={({ item }) =>
                isListView ? (
                  <CompactCard item={item} />
                ) : (
                  <Card className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <Image
                      style={{ height: 225, width: "100%" }}
                      source={item.image}
                      contentFit="cover"
                      transition={1000}
                      className="rounded-t-2xl"
                    />
                    <Link
                      href={{
                        pathname: "/(protected)/details/[id]",
                        params: {
                          id: item.id,
                          title: item.title,
                        },
                      }}
                    >
                      <CardHeader className="gap-2 p-4">
                        <CardTitle className="text-lg font-bold text-gray-900">
                          {item.title}
                        </CardTitle>
                        <Text
                          numberOfLines={2}
                          className="text-sm text-gray-600"
                        >
                          {item.description}
                        </Text>
                        <Text className="text-lg font-semibold text-blue-600">
                          ₹{item.price.toLocaleString()}
                        </Text>
                      </CardHeader>
                    </Link>
                  </Card>
                )
              }
              estimatedItemSize={385}
              ItemSeparatorComponent={() => <View className="h-2" />}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      )}
      {/* Fixed bottom buttons */}
      <View className="absolute bottom-6 flex w-full flex-row items-center justify-center gap-16">
        <Pressable
          onPress={pickCameraImage}
          className="h-16 w-16 items-center justify-center rounded-full bg-blue-600"
        >
          <AntDesign name="camera" size={28} color="white" />
        </Pressable>

        <Pressable
          onPress={pickDocImage}
          className="h-16 w-16 items-center justify-center rounded-full bg-blue-600"
        >
          <AntDesign name="picture" size={28} color="white" />
        </Pressable>
        <Pressable
          onPress={() => {
            Share.open({
              urls: [
                "file:///data/user/0/com.cpcjain.mobile/cache/DocumentPicker/d55fe9cb-9b6a-418a-af40-9c80b3e5d202.jpeg",
                "file:///data/user/0/com.cpcjain.mobile/cache/DocumentPicker/7dbb42b3-c696-4520-96d4-5b5fcd99e707.jpg",
              ],
              title: "Hello, this photos were shared from React Native Share",
            })
              .then((res) => {
                console.log(res);
              })
              .catch((err) => {
                err && console.log(err);
              });
          }}
          className="h-16 w-16 items-center justify-center rounded-full bg-blue-600"
        >
          <AntDesign name="sharealt" size={28} color="white" />
        </Pressable>
      </View>
    </View>
  );
}

const CompactCard = ({ item }: { item: CardItem }) => (
  <Card className="flex-row overflow-hidden rounded-lg bg-white shadow-sm">
    <Image
      style={{ width: 100, height: 100 }}
      source={item.image}
      contentFit="cover"
      className="rounded-l-lg"
    />
    <Link
      href={{
        pathname: "/(protected)/details/[id]",
        params: {
          id: item.id,
          title: item.title,
        },
      }}
      className="min-w-0 flex-1"
    >
      <View className="flex-1 p-3">
        <CardTitle
          className="mb-1 text-base font-bold text-gray-900"
          numberOfLines={1}
        >
          {item.title}
        </CardTitle>

        <Text
          className="mb-1 flex-1 text-sm text-gray-600"
          numberOfLines={2}
          style={{ lineHeight: 20 }}
        >
          {item.description}
        </Text>

        <Text
          className="text-base font-semibold text-blue-600"
          numberOfLines={1}
        >
          ₹{item.price.toLocaleString()}
        </Text>
      </View>
    </Link>
  </Card>
);
// file:///data/user/0/com.cpcjain.mobile/cache/DocumentPicker/d55fe9cb-9b6a-418a-af40-9c80b3e5d202.jpeg
// file:///data/user/0/com.cpcjain.mobile/cache/DocumentPicker/7dbb42b3-c696-4520-96d4-5b5fcd99e707.jpg
// Share.open({
//   urls: [
//     "file:///data/user/0/com.cpcjain.mobile/cache/DocumentPicker/d55fe9cb-9b6a-418a-af40-9c80b3e5d202.jpeg",
//     "file:///data/user/0/com.cpcjain.mobile/cache/DocumentPicker/7dbb42b3-c696-4520-96d4-5b5fcd99e707.jpg",
//   ],
//   title: "Hello, this photos were shared from React Native Share",
// })
//   .then((res) => {
//     console.log(res);
//   })
//   .catch((err) => {
//     err && console.log(err);
//   });
