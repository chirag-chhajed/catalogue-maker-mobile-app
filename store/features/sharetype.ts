import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import { useAppDispatch, useAppSelector } from "../hooks";

type ShareType = boolean;

const initialState: ShareType = true;

export const shareTypeSlice = createSlice({
  name: "shareType",
  initialState,
  reducers: {
    changeShareType: (_state, action: PayloadAction<boolean>) => {
      return action.payload;
    },
  },
});

export const { changeShareType } = shareTypeSlice.actions;

export const useShareType = () => {
  const shareType = useAppSelector((state) => state.shareType);
  return shareType;
};

export const useShareTypeDispatch = () => {
  const dispatch = useAppDispatch();

  return {
    updateShareType: (share: boolean) => {
      dispatch(changeShareType(share));
    },
  };
};
