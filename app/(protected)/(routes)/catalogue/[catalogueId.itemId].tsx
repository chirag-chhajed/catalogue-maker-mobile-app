import { useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Text } from "~/components/ui/text";

const CatalogueItem = () => {
  const { catalogueId, itemId } = useLocalSearchParams();
  return (
    <View>
      <Text>
        {catalogueId} {itemId}
      </Text>
    </View>
  );
};

export default CatalogueItem;
