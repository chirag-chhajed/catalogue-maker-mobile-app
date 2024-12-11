import { AntDesign } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image } from "expo-image";
import { View, StyleSheet, Pressable } from "react-native";

export default function DetailsScreen() {
  const { id, title } = useLocalSearchParams();
  const [image, setImage] = useState<string | null>(null);
  const pickCameraImage = async () => {
    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      allowsEditing: false,
      allowsMultipleSelection: false,
      mediaTypes: "images",
      selectionLimit: 1,
      cameraType: ImagePicker.CameraType.front,
    });

    console.log(result);

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  const pickDocImage = async () => {
    const doc = await DocumentPicker.getDocumentAsync({
      multiple: false,
      type: ["image/*"],
    });
    console.log(doc);
    if (!doc.canceled) {
      setImage(doc.assets[0].uri);
    }
  };
  return (
    <View style={styles.container}>
      {/* <Text>
        Details of user {id} {title}{" "}
      </Text> */}
      {image && <Image source={{ uri: image }} style={styles.image} />}

      {/* Fixed bottom buttons */}
      <View className="absolute bottom-6 flex w-full flex-row items-center justify-center gap-36">
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 200,
    height: 200,
  },
});
