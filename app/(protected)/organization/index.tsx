import { Image } from "expo-image";
import { Link } from "expo-router";
import React, { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { Text } from "~/components/ui/text";
import img from "~/assets/266.png";
import { AntDesign } from "@expo/vector-icons";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

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
              href={"/(protected)/organization/create-form"}
              className="text-center font-semibold text-white"
            >
              Create Your First Organization
            </Link>
          </Pressable>
          {/* </Link> */}
        </View>
      ) : (
        <ScrollView className="mb-4 flex-1">
          <View className="space-y-4">
            {organizations.map((org) => (
              <Card key={org.id} className="w-full">
                <CardHeader>
                  <CardTitle>{org.name}</CardTitle>
                  <CardDescription>{org.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <View className="items-center">
                    <Image
                      source={org.image}
                      style={{ width: 80, height: 80 }}
                      className="h-20 w-20 rounded-full"
                      contentFit="cover"
                    />
                  </View>
                </CardContent>
                <CardFooter>
                  <Badge
                    variant={org.role === "admin" ? "default" : "secondary"}
                  >
                    <Text className="capitalize">{org.role}</Text>
                  </Badge>
                </CardFooter>
              </Card>
            ))}
          </View>
        </ScrollView>
      )}

      <View className="self-center border-t border-gray-200 py-4">
        <Link href={"/(protected)/organization/join-form"}>
          <Text className="text-center text-blue-600 underline underline-offset-2">
            Have an invite code to join an organization?
          </Text>
        </Link>
      </View>
    </View>
  );
};

export default Index;
