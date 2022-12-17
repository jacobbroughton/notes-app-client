import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user";
import foldersReducer from "./folders";
import sidebarReducer from "./sidebar";
import pagesReducer from "./pages";
import modalsReducer from "./modals";
import themeReducer from "./theme";
import { saveState } from "../utils/localStorage.js";
import { batchedSubscribe } from "redux-batched-subscribe";

const store = configureStore({
  reducer: {
    user: userReducer,
    folders: foldersReducer,
    pages: pagesReducer,
    sidebar: sidebarReducer,
    modals: modalsReducer,
    theme: themeReducer,
  },
//   enhancers: [batchedSubscribe(() => saveState("light", "themeState"))],
});

export default store;

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
