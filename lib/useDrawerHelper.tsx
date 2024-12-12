// hooks/useDrawerHelper.ts
import { DrawerActions } from "@react-navigation/native";
import { useNavigation } from "expo-router";

export const useDrawerHelper = () => {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const closeDrawer = () => {
    navigation.dispatch(DrawerActions.closeDrawer());
  };

  return { openDrawer, closeDrawer };
};
