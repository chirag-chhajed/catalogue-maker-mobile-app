import { AntDesign, Feather, FontAwesome6 } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { Image, ImageContentFit } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  Dimensions,
  View,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import ImageModal from "react-native-image-modal";
import Carousel from "react-native-reanimated-carousel";
import Share from "react-native-share";

import { Text } from "~/components/ui/text";
import {
  downloadImagesToCache,
  downloadImagesToGallery,
} from "~/lib/downloadImagesToCache";
import { type ImageType, useGetCatalogItemsQuery } from "~/store/features/api";

const DetailsPage = () => {
  const { id, catalogueId } = useLocalSearchParams();
  const { width, height } = Dimensions.get("window");
  const { data, isLoading } = useGetCatalogItemsQuery(
    { id },
    {
      skip: !id,
    },
  );
  const rearrangedData = useMemo(() => {
    const matchIndex = data?.items.findIndex((item) => item.id === catalogueId);
    if (matchIndex === -1) return data?.items;

    const beforeMatch = data?.items.slice(0, matchIndex);
    const afterMatch = data?.items.slice(matchIndex + 1);
    const matchItem = data?.items[matchIndex];

    return [matchItem, ...afterMatch, ...beforeMatch];
  }, [id]);
  if (isLoading) {
    return <Text>Loading</Text>;
  }
  return (
    <View style={{ flex: 1, width, height }}>
      <FlashList
        data={rearrangedData}
        estimatedItemSize={width}
        estimatedListSize={{ height, width }}
        renderItem={({ item }) => (
          <Slide {...item} key={`details-${item.id}`} />
        )}
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        horizontal
      />
    </View>
  );
};
export default DetailsPage;

const Slide = ({
  images,
  name,
  description,
  price,
}: {
  images: ImageType[];
  name: string;
  description: string;
  price: number;
}) => {
  const { width, height } = Dimensions.get("window");

  return (
    <ScrollView style={{ height, width }} className="flex-1 bg-white">
      <View className="h-[275px]">
        <Carousel
          width={width}
          height={275}
          data={images}
          loop={false}
          vertical
          renderItem={({ item }) => (
            <ImageModal
              source={{ uri: item.imageUrl }}
              resizeMode="contain"
              style={{ width, height: 275 }}
              renderImageComponent={({ style, source, resizeMode }) => (
                <Image
                  style={style}
                  source={source}
                  contentFit={resizeMode as ImageContentFit}
                  placeholder={item.blurhash}
                />
              )}
              renderFooter={() => (
                <View className="flex-row items-center justify-around bg-black/50 p-4">
                  <Pressable
                    onPress={async () => {
                      try {
                        const cachedImages = await downloadImagesToCache([
                          item.imageUrl,
                        ]);
                        Share.open({ urls: cachedImages });
                      } catch (error) {
                        console.log(error);
                      }
                    }}
                    className="items-center rounded-full bg-white/20 p-3"
                  >
                    <Feather
                      name={Platform.OS === "android" ? "share-2" : "share"}
                      size={24}
                      color="white"
                    />
                  </Pressable>

                  <Pressable
                    onPress={async () => {
                      try {
                        await downloadImagesToGallery([item.imageUrl]);
                        Alert.alert("Success", "Image saved to gallery");
                      } catch (error) {
                        Alert.alert("Error", "Failed to save image");
                      }
                    }}
                    className="items-center rounded-full bg-white/20 p-3"
                  >
                    <Feather name="download" size={24} color="white" />
                  </Pressable>

                  <Pressable
                    onPress={async () => {
                      try {
                        const cachedImages = await downloadImagesToCache([
                          item.imageUrl,
                        ]);
                        await Share.shareSingle({
                          title: "Share Image",
                          urls: cachedImages,
                          social: Share.Social.WHATSAPP,
                        });
                      } catch (err) {
                        console.error(err);
                      }
                    }}
                    className="items-center rounded-full bg-white/20 p-3"
                  >
                    <FontAwesome6 name="whatsapp" size={24} color="white" />
                  </Pressable>
                </View>
              )}
            />
          )}
        />
      </View>

      <View className="px-6 py-4">
        <View className=" flex-row justify-start gap-4 border-gray-200 pt-4">
          <Pressable
            onPress={async () => {
              try {
                const cachedImages = await downloadImagesToCache(
                  images.map((image) => image.imageUrl),
                );
                Share.open({ urls: cachedImages, title: name });
              } catch (error) {
                console.log(error);
              }
            }}
            className="items-center rounded-full bg-slate-200 p-2 shadow-sm active:bg-gray-50"
          >
            <Feather
              name={Platform.OS === "android" ? "share-2" : "share"}
              size={24}
              color="#374151"
            />
          </Pressable>

          <Pressable
            onPress={async () => {
              try {
                await downloadImagesToGallery(
                  images.map((img) => img.imageUrl),
                );
                Alert.alert("Success", "Images downloaded to gallery");
              } catch (error) {
                Alert.alert("Error", "Failed to download images");
              }
            }}
            className="items-center rounded-full bg-slate-200 p-2 shadow-sm active:bg-gray-50"
          >
            <Feather name="download" size={24} color="#374151" />
          </Pressable>

          <Pressable
            onPress={async () => {
              try {
                const cachedImages = await downloadImagesToCache(
                  images.map((img) => img.imageUrl),
                );
                console.log(cachedImages);
                await Share.shareSingle({
                  title: "Title",
                  urls: cachedImages,
                  social: Share.Social.WHATSAPP,
                });
              } catch (err) {
                console.error(err);
              }
            }}
            className="items-center rounded-full bg-slate-200 p-2 shadow-sm active:bg-gray-50"
          >
            <FontAwesome6 name="whatsapp" size={24} color="#25D366" />
          </Pressable>

          <Pressable
            onPress={async () => {
              await Share.open({
                message: "https://www.google.com",
              });
            }}
            className="items-center rounded-full bg-slate-200 p-2 shadow-sm active:bg-gray-50"
          >
            <AntDesign name="link" size={24} color="#374151" />
          </Pressable>
        </View>
        <Text className="mt-6 text-2xl font-bold text-gray-800">{name}</Text>
        <Text className="mt-2 text-lg font-semibold text-green-600">
          ₹{price}
        </Text>
        <Text className="mt-3 flex-wrap text-base leading-6 text-gray-600">
          {description} Lorem ipsum dolor sit amet, consectetur adipisicing
          elit. Voluptates, consequatur. Nihil molestias voluptatibus iste
          minus? Adipisci, ipsam. Obcaecati ea modi, architecto autem explicabo
          tempora maiores debitis ad sed minima ipsa, repellendus consequuntur
          nobis in id earum reprehenderit adipisci nesciunt? Vitae deleniti
          optio labore dignissimos quod, sapiente cumque nesciunt qui eos
          officia repudiandae explicabo enim excepturi. Officiis quod tenetur
          eum modi veritatis, facere ipsam fuga assumenda, optio obcaecati
          saepe, id neque dolores incidunt molestiae recusandae temporibus ipsa
          tempora. At a labore neque, officia eius, dolorem molestiae aliquam
          vel, pariatur harum molestias quos fugit cum temporibus vero. Quis
          architecto facilis error ex quidem, soluta ullam deleniti? Saepe
          voluptatum delectus aliquam natus quam incidunt cupiditate. Doloremque
          at maiores eius harum expedita id corrupti veniam sed non obcaecati
          eligendi ipsum est assumenda optio inventore cumque, et ut cupiditate
          autem omnis consequuntur, ipsam ea voluptatum! Magni quasi iste
          necessitatibus dignissimos nesciunt maiores at optio sit voluptas, ea
          consequatur minus nam odit? Debitis illo esse rerum, voluptates quos
          voluptatum tenetur quis sunt vero expedita minima, ea maiores sequi
          distinctio error? Omnis sed, ratione iusto ipsam tenetur nulla nobis
          praesentium sit quia, doloremque id. Incidunt blanditiis mollitia,
          odit a similique quis in quas vel saepe quod ipsa!
        </Text>
      </View>
    </ScrollView>
  );
};
