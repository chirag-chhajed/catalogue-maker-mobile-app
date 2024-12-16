import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { storage } from "./storage";

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
    changeOrganizationId: (orgId: number) =>
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
      const storedId = storage.getNumber("user_preferred_org");
      console.log("storedId", storedId);
      if (typeof storedId === "number") {
        changeOrganizationId(storedId);
      } else {
        clearOrganizationId();
      }
    }
  }, [organizationId]);

  return organizationId;
};
