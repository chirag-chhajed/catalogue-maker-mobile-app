import { Text, View, TextInput, Pressable, Image } from "react-native";
import React, { useState } from "react";

export default function CreateForm() {
  const [name, setName] = useState("");

  const handleSubmit = () => {
    console.log("Organization name:", name);
  };

  return (
    <View className="flex-1 items-center justify-center p-6">
      {/* Placeholder Image */}
      <View className="mb-8 items-center">
        <Image
          source={{
            uri: "https://illustrations.popsy.co/amber/remote-team.svg",
          }}
          className="h-48 w-48"
          resizeMode="contain"
        />
      </View>

      {/* Form Container */}
      <View className="w-full max-w-md rounded-lg bg-white p-6 shadow-sm">
        <Text className="text-2xl font-bold text-gray-800">
          Create New Organization
        </Text>
        <Text className="mb-6 mt-2 text-sm text-gray-600">
          Enter a name for your new organization
        </Text>

        <View className="space-y-4">
          <View>
            <Text className="mb-1 text-sm font-medium text-gray-700">Name</Text>
            <TextInput
              className="w-full rounded-md border border-gray-300 px-4 py-2 focus:border-blue-500"
              value={name}
              onChangeText={setName}
              placeholder="Enter organization name"
            />
          </View>

          <Pressable
            onPress={handleSubmit}
            className="mt-4 w-full rounded-md bg-blue-600 py-3"
          >
            <Text className="text-center font-semibold text-white">
              Create Organization
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
