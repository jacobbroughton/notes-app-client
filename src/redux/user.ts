import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { useState } from "react";

type UserState = null | object;

const initialState: UserState = null;

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, { payload }: PayloadAction<UserState>) => {
      if (!payload) return null
      return {
        ...payload
      }
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;
