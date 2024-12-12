import { FlashList } from "@shopify/flash-list";
import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";

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

const Index = () => {
  const [organizationsExist, setOrganizationsExist] = useState(true);

  const organizations = [
    {
      id: 1,
      name: "Team Alpha",
      role: "admin",
      description: "Development team",
      image: "https://picsum.photos/200",
    },
    {
      id: 2,
      name: "Project Beta",
      role: "editor",
      description: "Design team",
      image: "https://picsum.photos/200",
    },
    {
      id: 3,
      name: "Studio Gamma",
      role: "viewer",
      description: "Marketing team",
      image: "https://picsum.photos/200",
    },
  ];

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
              href="/(protected)/organization/create-form"
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
              renderItem={({ item: org }) => (
                <Card
                  key={org.id}
                  className="mb-4 flex w-full flex-row items-end justify-between py-3"
                >
                  <View>
                    <CardHeader>
                      <CardTitle>{org.name}</CardTitle>
                      <CardDescription>{org.description}</CardDescription>
                    </CardHeader>

                    <CardFooter>
                      <Badge
                        variant={org.role === "admin" ? "default" : "secondary"}
                      >
                        <Text className="capitalize">{org.role}</Text>
                      </Badge>
                    </CardFooter>
                  </View>
                  <CardContent>
                    <Image
                      source="https://picsum.photos/80"
                      style={{ height: 80, width: 80, borderRadius: 40 }}
                    />
                  </CardContent>
                </Card>
              )}
            />
          </View>
        </ScrollView>
      )}

      <View className="self-center border-t border-gray-200 py-4">
        <Link href="/(protected)/organization/join-form">
          <Text className="text-center text-blue-600 underline underline-offset-2">
            Have an invite code to join an organization?
          </Text>
        </Link>
      </View>
    </View>
  );
};

export default Index;
