import { Text, View, TextInput, Pressable, Image } from "react-native";
import React, { useState } from "react";

export default function CreateCatalogForm() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    console.log("Catalog name:", name);
    console.log("Catalog description:", description);
  };

  return (
    <View className="flex-1 items-center justify-center p-6">
      <View className="mb-8 items-center">
        <Image
          source={{
            uri: "https://picsum.photos/192",
          }}
          style={{ height: 192, width: 192 }}
          className="h-48 w-48"
          resizeMode="contain"
        />
      </View>

      <View className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800">
          Create New Catalogue
        </Text>
        <Text className="mb-6 mt-2 text-sm text-gray-600">
          Enter details for your new Catalogue
        </Text>

        <View>
          <View className="mb-4">
            <Text className="mb-1 text-sm font-medium text-gray-700">Name</Text>
            <TextInput
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500"
              value={name}
              onChangeText={setName}
              placeholder="Enter Catalogue name"
            />
          </View>

          <View className="mb-4">
            <Text className="mb-1 text-sm font-medium text-gray-700">
              Description
            </Text>
            <TextInput
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500"
              value={description}
              onChangeText={setDescription}
              placeholder="Enter Catalogue description"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            className="mt-4 w-full rounded-md bg-blue-600 py-3"
          >
            <Text className="text-center font-semibold text-white">
              Create Catalogue
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
