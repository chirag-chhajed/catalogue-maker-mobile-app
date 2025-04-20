import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { useGetApiV1CatalogueByCatalogueIdAndItemIdQuery } from "~/store/features/api/newApis";

const CatalogueItem = () => {
  const { catalogueId, itemId } = useLocalSearchParams();

  const { data } = useGetApiV1CatalogueByCatalogueIdAndItemIdQuery(
    {
      catalogueId: catalogueId as string,
      itemId: itemId as string,
    },
    {
      skip: !catalogueId || !itemId,
    },
  );

  console.log(data);

  return (
    <View>
      <Text>{JSON.stringify(data)}</Text>
    </View>
  );
};

export default CatalogueItem;
