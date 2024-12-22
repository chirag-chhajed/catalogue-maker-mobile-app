import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { storage } from "../storage";

type OrganizationId = { organizationId: string | null };

const initialState: OrganizationId = {
  organizationId: null,
};
export const helloSlice = createSlice({
  name: "default_organization",
  initialState,
  reducers: {
    changeOrganizationId: (_state, action: PayloadAction<string>) => {
      storage.set("user_preferred_org", action.payload);
      return { organizationId: action.payload };
    },
    clearOrganizationId: (_state) => {
      storage.delete("user_preferred_org");
      return { organizationId: null };
    },
  },
});

export const { changeOrganizationId, clearOrganizationId } = helloSlice.actions;
