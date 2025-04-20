import { AntDesign, FontAwesome6 } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { View, Dimensions, Pressable, ScrollView } from "react-native";
import Share from "react-native-share";
import { Text } from "~/components/ui/text";
import { THEME_COLORS } from "~/lib/constants";
import {
  downloadImagesToCache,
  downloadImagesToGallery,
} from "~/lib/downloadImagesToCache";
import { useGetApiV1CatalogueByCatalogueIdAndItemIdQuery } from "~/store/features/api/newApis";
import ImageModal from "react-native-image-modal";

const CatalogueItem = () => {
  const { catalogueId, itemId } = useLocalSearchParams();
  const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } =
    Dimensions.get("window");

  const { data, isLoading } = useGetApiV1CatalogueByCatalogueIdAndItemIdQuery(
    {
      catalogueId: catalogueId as string,
      itemId: itemId as string,
    },
    {
      skip: !catalogueId || !itemId,
    },
  );

  if (isLoading || !data) {
    return (
      <View className="flex-1 items-center justify-center">
        <Text className="font-mono text-foreground">Loading...</Text>
      </View>
    );
  }

  const handleWhatsAppShare = async () => {
    const cacheUrl = await downloadImagesToCache([data.image.imageUrl]);
    await Share.open({
      urls: cacheUrl,
      social: Share.Social.WHATSAPP,
    });
  };

  const handleShare = async () => {
    const cacheUrl = await downloadImagesToCache([data.image.imageUrl]);
    await Share.open({
      urls: cacheUrl,
    });
  };

  const handleDownload = async () => {
    await downloadImagesToGallery([data.image.imageUrl]);
  };

  return (
    <View className="flex-1 bg-background">
      <ImageModal
        resizeMode="contain"
        source={{ uri: data.image.imageUrl }}
        style={{ height: SCREEN_HEIGHT * 0.5, width: SCREEN_WIDTH }}
        renderImageComponent={({ source, resizeMode, style }) => (
          <Image
            source={source}
            style={style}
            contentFit={resizeMode}
            placeholder={{ blurhash: data.image.blurhash }}
          />
        )}
      />

      <View className="relative flex-1">
        <ScrollView
          className="flex-1 p-4"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-28"
        >
          <View className="gap-4">
            <Text className="font-mono text-2xl font-bold text-foreground">
              {data.name}
            </Text>

            <Text className="font-mono text-xl font-bold text-primary">
              ₹{data.price}
            </Text>

            {data.description ? (
              <Text className="font-mono text-base text-muted-foreground">
                {data.description}
              </Text>
            ) : null}
          </View>
        </ScrollView>

        <View className="absolute bottom-0 left-0 right-0 bg-background/80 p-6 backdrop-blur-sm">
          <View className="flex-row gap-4">
            <Pressable
              onPress={handleShare}
              className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
            >
              <AntDesign
                name="sharealt"
                size={24}
                color={THEME_COLORS.primaryForeground}
              />
            </Pressable>

            <Pressable
              onPress={handleWhatsAppShare}
              className="h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg"
            >
              <FontAwesome6 name="whatsapp" size={24} color="white" />
            </Pressable>

            <Pressable
              onPress={handleDownload}
              className="h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg"
            >
              <AntDesign
                name="download"
                size={24}
                color={THEME_COLORS.primaryForeground}
              />
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );
};

export default CatalogueItem;
