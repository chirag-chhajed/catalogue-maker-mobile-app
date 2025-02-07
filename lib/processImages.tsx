import React, { useRef, useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";

import { useGetImagesFromGroup } from "~/store/features/sharableImageSlice"; // Adjust the import path as necessary

export function PolaroidImageCapture({
  groupId,
  onCaptureComplete,
}: Readonly<{
  groupId: string;
  onCaptureComplete: (uris: string[]) => void;
}>) {
  const viewShotRefs = useRef([]);
  const images = useGetImagesFromGroup(groupId);

  useEffect(() => {
    const captureImages = async () => {
      if (!images || images.length === 0) return;

      const uris = [];
      for (let i = 0; i < images.length; i++) {
        const uri = await captureRef(viewShotRefs.current[i], {
          quality: 1.0,
          format: "jpg",
        });
        uris.push(uri);
      }
      onCaptureComplete(uris); // Pass the URIs back to the parent
    };

    captureImages();
  }, [images, onCaptureComplete]);

  return (
    <View style={{ position: "absolute", left: -9999 }}>
      {images?.map((image, index) => (
        <ViewShot
          key={image.id}
          ref={(el) => (viewShotRefs.current[index] = el)}
          options={{ format: "jpg", quality: 0.8 }}
        >
          <View style={styles.polaroid}>
            <Image source={{ uri: image.imageUrl }} style={styles.image} />
            <View style={styles.info}>
              <Text className="font-mono" style={styles.name}>
                {image.name}
              </Text>
              <Text className="font-mono" style={styles.description}>
                {image.description}
              </Text>
              <Text style={styles.price}>₹{image.price}</Text>
            </View>
          </View>
        </ViewShot>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  polaroid: {
    borderWidth: 8, // Slightly smaller border
    borderColor: "white",
    backgroundColor: "white",
    padding: 6, // Reduced padding
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  image: {
    width: "100%", // You can set the height dynamically where you use this
    aspectRatio: 1,
    objectFit: "contain",
  },
  info: {
    marginTop: 6, // Reduced spacing
    alignItems: "flex-start", // Align text to the start
  },
  name: {
    fontWeight: "bold",
  },
  price: {
    color: "green",
  },
});
