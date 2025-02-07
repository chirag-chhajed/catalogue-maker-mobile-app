import React, { useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  InteractionManager,
} from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";

import { useGetImagesFromGroup } from "~/store/features/sharableImageSlice";

export function PolaroidImageCapture({
  groupId,
  onCaptureComplete,
}: Readonly<{
  groupId: string;
  onCaptureComplete: (uris: string[]) => void;
}>) {
  const viewShotRefs = useRef([]);
  const images = useGetImagesFromGroup(groupId);
  const previousImagesRef = useRef<typeof images>();

  const captureImages = useCallback(async () => {
    if (!images || images.length === 0) return;

    // Only capture if images have changed
    if (JSON.stringify(previousImagesRef.current) === JSON.stringify(images)) {
      return;
    }

    previousImagesRef.current = images;

    // Wait for any animations/interactions to complete
    InteractionManager.runAfterInteractions(async () => {
      const uris = await Promise.all(
        viewShotRefs.current.map((ref) =>
          captureRef(ref, {
            quality: 1.0,
            format: "jpg",
          }),
        ),
      );

      onCaptureComplete(uris);
    });
  }, [images, onCaptureComplete]);

  const handleLayout = useCallback(() => {
    InteractionManager.runAfterInteractions(captureImages);
  }, [captureImages]);

  if (!images || images.length === 0) return null;

  return (
    <View style={{ position: "absolute", left: -9999 }} onLayout={handleLayout}>
      {images.map((image, index) => (
        <ViewShot
          key={image.id}
          ref={(el) => (viewShotRefs.current[index] = el)}
          options={{ format: "jpg", quality: 0.8 }}
          onLayout={() =>
            InteractionManager.runAfterInteractions(captureImages)
          }
        >
          <View style={styles.polaroid}>
            <Image
              source={{ uri: image.imageUrl }}
              style={styles.image}
              onLoad={() =>
                InteractionManager.runAfterInteractions(captureImages)
              }
            />
            <View style={styles.info}>
              <Text className="font-mono" style={styles.name}>
                {image.name}
              </Text>
              <Text className="font-mono">{image.description}</Text>
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
