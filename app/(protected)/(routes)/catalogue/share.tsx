import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import { useRef, useState } from "react";
import { Dimensions, ScrollView, View, Pressable } from "react-native";
import Share from "react-native-share";
import ViewShot from "react-native-view-shot";

import { Text } from "~/components/ui/text";
import { THEME_COLORS } from "~/lib/constants";
import { downloadImagesToGallery } from "~/lib/downloadImagesToCache";
import { cn } from "~/lib/utils";
import {
  useCaptureViewShotsQuery,
  useGetCachedImagesQuery,
} from "~/store/features/api/imageApi";
import { useGetBulkImages } from "~/store/features/newSharableImageSlice";
import { useShareType } from "~/store/features/sharetype";

const ShareScreen = () => {
  const images = useGetBulkImages();
  const shareType = useShareType();
  const { data, isLoading } = useGetCachedImagesQuery(images);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const viewShotRefs = useRef<ViewShot[]>([]);
  const { data: viewShotUrls, isLoading: isCapturing } =
    useCaptureViewShotsQuery(
      {
        refs: viewShotRefs.current,
        imageUrls: data?.map((image) => image.image) || [],
      },
      {
        skip: !data || loadedImages.size !== data.length,
      },
    );

  const handleImageLoad = (imageUrl: string) => {
    setLoadedImages((prev) => new Set([...prev, imageUrl]));
  };

  const handleWhatsAppShare = async () => {
    await Share.open({
      urls: shareType ? viewShotUrls : data?.map((image) => image.image),
      social: Share.Social.WHATSAPP,
    }).then(() => {
      router.back();
    });
  };

  const handleDownload = async () => {
    if (shareType) {
      await downloadImagesToGallery(viewShotUrls || []);
    } else {
      await downloadImagesToGallery(data?.map((image) => image.image) || []);
    }
  };
  if (isLoading)
    return (
      <View>
        <Text>Loading...</Text>
      </View>
    );

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={screenWidth + 16}
        decelerationRate="fast"
        snapToAlignment="center"
        contentContainerStyle={{
          paddingHorizontal: 8,
          gap: 16,
        }}
      >
        {data?.map((image, index) => {
          const aspectRatio = image.width / image.height;
          let imageHeight = screenWidth / aspectRatio;
          if (imageHeight > screenHeight - 100) {
            imageHeight = screenHeight - 100;
            const imageWidth = imageHeight * aspectRatio;

            return (
              <View
                key={image.image}
                className="py-4"
                style={{ width: screenWidth }}
              >
                {shareType ? (
                  <ViewShot
                    ref={(ref) => {
                      if (ref) viewShotRefs.current[index] = ref;
                    }}
                    options={{
                      format: "jpg",
                      quality: 1,
                    }}
                  >
                    <View
                      className="self-start bg-white shadow-lg"
                      style={{ width: imageWidth + 24, padding: 12 }}
                    >
                      <ExpoImage
                        source={{ uri: image.image }}
                        style={{ width: imageWidth, height: imageHeight }}
                        onLoadEnd={() => handleImageLoad(image.image)}
                        contentFit="cover"
                      />
                      <View className="flex-row justify-between pb-2 pt-4">
                        <Text className="font-mono text-lg font-bold">
                          {image.name}
                        </Text>
                        <Text className="font-mono text-base font-bold">
                          ₹{image.price}
                        </Text>
                      </View>
                    </View>
                  </ViewShot>
                ) : (
                  <ExpoImage
                    source={{ uri: image.image }}
                    style={{ width: imageWidth, height: imageHeight }}
                    onLoadEnd={() => handleImageLoad(image.image)}
                    contentFit="cover"
                  />
                )}
              </View>
            );
          }

          return (
            <View
              key={image.image}
              className="py-4"
              style={{ width: screenWidth }}
            >
              {shareType ? (
                <ViewShot
                  ref={(ref) => {
                    if (ref) viewShotRefs.current[index] = ref;
                  }}
                  options={{
                    format: "jpg",
                    quality: 1,
                  }}
                >
                  <View
                    className="self-start bg-white shadow-lg"
                    style={{
                      width: screenWidth - 32,
                      padding: 12,
                      marginHorizontal: 16,
                    }}
                  >
                    <ExpoImage
                      source={{ uri: image.image }}
                      style={{ width: screenWidth - 56, height: imageHeight }}
                      onLoadEnd={() => handleImageLoad(image.image)}
                      contentFit="cover"
                    />
                    <View className="flex-row justify-between pb-2 pt-4">
                      <Text className="font-mono text-lg font-bold">
                        {image.name}
                      </Text>
                      <Text className="font-mono text-base font-bold">
                        ₹{image.price}
                      </Text>
                    </View>
                  </View>
                </ViewShot>
              ) : (
                <ExpoImage
                  source={{ uri: image.image }}
                  style={{ width: screenWidth - 56, height: imageHeight }}
                  className="mx-4"
                  onLoadEnd={() => handleImageLoad(image.image)}
                  contentFit="cover"
                />
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Action Buttons */}
      <View className="absolute bottom-6 left-6 flex-row gap-4">
        <Pressable
          onPress={async () => {
            await Share.open({
              urls: shareType
                ? viewShotUrls
                : data?.map((image) => image.image),
            }).then(() => {
              router.back();
            });
          }}
          disabled={isCapturing}
          className={cn(
            "h-14 w-14 items-center justify-center rounded-full shadow-lg",
            isCapturing ? "bg-gray-400" : "bg-primary",
          )}
        >
          {isCapturing ? (
            <AntDesign
              name="loading1"
              size={24}
              color={THEME_COLORS.primaryForeground}
            />
          ) : (
            <AntDesign
              name="sharealt"
              size={24}
              color={THEME_COLORS.primaryForeground}
            />
          )}
        </Pressable>

        <Pressable
          onPress={handleWhatsAppShare}
          disabled={isCapturing}
          className={cn(
            "h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg",
            isCapturing && "opacity-50",
          )}
        >
          <FontAwesome6 name="whatsapp" size={24} color="white" />
        </Pressable>

        <Pressable
          onPress={handleDownload}
          disabled={isCapturing}
          className={cn(
            "h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg",
            isCapturing && "opacity-50",
          )}
        >
          <AntDesign
            name="download"
            size={24}
            color={THEME_COLORS.primaryForeground}
          />
        </Pressable>
      </View>
    </View>
  );
};

export default ShareScreen;
