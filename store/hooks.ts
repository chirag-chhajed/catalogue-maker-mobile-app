import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { storage } from "./storage";

import { clearImages, setImages } from "~/store/features/imageSlice";
import {
  changeOrganizationId,
  clearOrganizationId,
} from "~/store/features/organizationId";
import type { AppDispatch, RootState } from "~/store/store";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

export const useOrganitionIdDispatch = () => {
  const dispatch = useAppDispatch();

  return {
    changeOrganizationId: (orgId: string) =>
      dispatch(changeOrganizationId(orgId)),
    clearOrganizationId: () => dispatch(clearOrganizationId()),
  };
};

export const useOrganizationIdSelector = () => {
  const { organizationId } = useAppSelector((state) => state.orgId);
  const { changeOrganizationId, clearOrganizationId } =
    useOrganitionIdDispatch();

  useEffect(() => {
    if (!organizationId) {
      const storedId = storage.getString("user_preferred_org");
      if (typeof storedId === "string") {
        changeOrganizationId(storedId);
      } else {
        clearOrganizationId();
      }
    }
  }, [organizationId]);

  return organizationId;
};

export const useGetImages = () => {
  const images = useAppSelector((state) => state.image);
  return images;
};

export const useDispatchImages = () => {
  const dispatch = useAppDispatch();
  return {
    setImages: (
      images: {
        uri: string;
        name: string;
        type: string;
      }[],
    ) => dispatch(setImages(images)),
    clearImages: () => dispatch(clearImages()),
  };
};

export const useUserState = () => {
  const { user } = useAppSelector((state) => state.hello);

  return user;
};
