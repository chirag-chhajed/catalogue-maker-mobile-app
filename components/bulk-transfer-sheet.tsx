import { BottomSheetView } from "@gorhom/bottom-sheet";
import { View, Pressable } from "react-native";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Text } from "./ui/text";
import { Button } from "./ui/button";
import { useState } from "react";

const BulkTransferSheet = ({
  onPress,
}: {
  onPress: (selected: "transfer" | "clone") => void;
}) => {
  const [selected, setSelected] = useState<"transfer" | "clone">("clone");
  return (
    <BottomSheetView>
      <View className="gap-4 p-4">
        <RadioGroup
          value={selected}
          onValueChange={(val) => setSelected(val)}
          className="flex flex-row justify-between"
        >
          <Pressable onPress={() => setSelected("transfer")} className="flex-1">
            <View className="flex-row items-center gap-2">
              <RadioGroupItem hitSlop={30} value="transfer" id="transfer" />
              <Text className="text-foreground">Transfer Items</Text>
            </View>
          </Pressable>
          <Pressable onPress={() => setSelected("clone")} className="flex-1">
            <View className="flex-row items-center gap-2">
              <RadioGroupItem hitSlop={30} value="clone" id="clone" />
              <Text className="text-foreground">Clone Items</Text>
            </View>
          </Pressable>
        </RadioGroup>
        <Button onPress={() => onPress(selected)} className="w-full">
          <Text className="font-medium text-primary-foreground">Continue</Text>
        </Button>
      </View>
    </BottomSheetView>
  );
};

export { BulkTransferSheet };
